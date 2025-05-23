import Page from "@/app/dashboard/page";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useMutation, useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import BASE_URL from "@/config/BaseUrl";
import moment from "moment";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Download } from "lucide-react";
import axios from "axios";
import { ButtonConfig } from "@/config/ButtonConfig";
import { useState } from "react";
import {
  SalesAccountDownload,
  SalesAccountView,
} from "@/components/buttonIndex/ButtonComponents";
import useApiToken from "@/components/common/useApiToken";

const salesAccountFormSchema = z.object({
  from_date: z.string().min(1, "From date is required"),
  to_date: z.string().min(1, "To Date is required"),
  branch_name: z.string().optional(),
});
const createSalesAccount = async (data, token) => {
  if (!token) throw new Error("No authentication token found");

  const response = await fetch(
    `${BASE_URL}/api/panel-fetch-sales-accounts-report`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    }
  );

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to create sales account");
  }
  return response.json();
};

// Header component
const BranchHeader = () => (
  <div
    className={`flex sticky top-0 z-10 border border-gray-200 rounded-lg justify-between ${ButtonConfig.cardheaderColor} items-start gap-8 mb-2 p-4 shadow-sm`}
  >
    <div className="flex-1">
      <h1 className="text-3xl font-bold text-gray-800">
        Sales Account Summary
      </h1>
      <p className="text-gray-600 mt-2">Add a Sales Account to Visit Report</p>
    </div>
  </div>
);

const SalesAccountForm = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const token = useApiToken();

  // Form state
  const [formData, setFormData] = useState({
    from_date: moment().startOf("month").format("YYYY-MM-DD"),
    to_date: moment().format("YYYY-MM-DD"),
    branch_name: "",
  });

  const createSalesAccountMutation = useMutation({
    mutationFn: ([data, token]) => createSalesAccount(data, token),

    onSuccess: (data) => {
      navigate("/report/sales-account-report", {
        state: {
          reportData: data,
          formData: formData,
        },
      });
    },

    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Handle form input changes
  const handleInputChange = (field, valueOrEvent) => {
    const value =
      typeof valueOrEvent === "object" && valueOrEvent.target
        ? valueOrEvent.target.value
        : valueOrEvent;

    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const validatedData = salesAccountFormSchema.parse(formData);
      createSalesAccountMutation.mutate([validatedData, token]);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorMessages = error.errors.map(
          (err) => `${err.path.join(".")}: ${err.message}`
        );

        toast({
          title: "Validation Error",
          description: (
            <ul className="list-disc pl-5">
              {errorMessages.map((message, index) => (
                <li key={index}>{message}</li>
              ))}
            </ul>
          ),
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  const handleDownload = async (e) => {
    e.preventDefault();

    try {
      const response = await axios({
        url: `${BASE_URL}/api/panel-download-sales-accounts-report`,
        method: "POST",
        data: formData,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "sales_account.csv");
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast({
        title: "Success",
        description: "Sales Account downloaded successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to download report",
        variant: "destructive",
      });
    }
  };

  return (
    <Page>
      <BranchHeader />
      <Card className={`mb-6 ${ButtonConfig.cardColor}`}>
        <CardContent className="p-4">
          <div className="w-full p-4">
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-3 gap-6">
                <div>
                  <label
                    className={`block ${ButtonConfig.cardLabel} text-sm mb-2 font-medium`}
                  >
                    Enter From Date <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="date"
                    value={formData.from_date}
                    className="bg-white"
                    onChange={(e) => handleInputChange("from_date", e)}
                    placeholder="Enter From Date"
                  />
                </div>

                <div>
                  <label
                    className={`block ${ButtonConfig.cardLabel} text-sm mb-2 font-medium`}
                  >
                    Enter To Date <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="date"
                    className="bg-white"
                    value={formData.to_date}
                    onChange={(e) => handleInputChange("to_date", e)}
                    placeholder="Enter To Date"
                  />
                </div>
              </div>

              <div className="flex flex-row items-end mt-3 justify-end w-full">
                <SalesAccountDownload
                  type="button"
                  className={`ml-2 ${ButtonConfig.backgroundColor} ${ButtonConfig.hoverBackgroundColor} ${ButtonConfig.textColor}`}
                  onClick={handleDownload}
                >
                  <Download className="h-4 w-4 mr-2" /> Download
                </SalesAccountDownload>
                <SalesAccountView
                  type="submit"
                  className={`${ButtonConfig.backgroundColor} ${ButtonConfig.hoverBackgroundColor} ${ButtonConfig.textColor} ml-2 flex items-center`}
                  disabled={createSalesAccountMutation.isPending}
                >
                  {createSalesAccountMutation.isPending
                    ? "Submitting..."
                    : "Submit Sales Account"}
                </SalesAccountView>
              </div>
            </form>
          </div>
        </CardContent>
      </Card>
    </Page>
  );
};

export default SalesAccountForm;
