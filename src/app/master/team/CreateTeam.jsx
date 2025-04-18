import { useToast } from "@/hooks/use-toast";
import React, { useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import axios from "axios";
import BASE_URL from "@/config/BaseUrl";
import { Loader2, SquarePlus } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useLocation } from "react-router-dom";
import { ButtonConfig } from "@/config/ButtonConfig";
import { useFetchCompanies, useFetchUserType } from "@/hooks/useApi";
import useApiToken from "@/components/common/useApiToken";
import { useSelector } from "react-redux";

const CreateTeam = () => {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [companies, setCompanies] = useState([]);
  const [userPositions, setUserPositions] = useState([]);
  const { toast } = useToast();
  const { pathname } = useLocation();
  const queryClient = useQueryClient();
  const userId = useSelector((state) => state.auth.id);
  const token = useApiToken();
  const [formData, setFormData] = useState({
    company_id: "",
    name: "",
    email: "",
    mobile: "",
    user_type: "",
    user_position: "",
  });

  const { data: companiesData } = useFetchCompanies({
    enabled: userId === "4",
  });

  const { data: userTypeData } = useFetchUserType();

  const handleInputChange = (e) => {
    const { name, value, type } = e.target;

    let formattedValue = value;

    if (type === "tel") {
      formattedValue = value.replace(/\D/g, "");
    }

    if (type === "email") {
      formattedValue = value.toLowerCase().trim();
    }

    setFormData((prev) => ({
      ...prev,
      [name]: formattedValue,
    }));
  };

  const handleSelectChange = (value, name) => {
    if (name === "user_position") {
      const selectedPosition = userTypeData?.userType?.find(
        (pos) => pos.user_position === value
      );
      setFormData((prev) => ({
        ...prev,
        user_position: value,
        user_type: selectedPosition
          ? selectedPosition.user_type.toString()
          : "",
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (
      !formData.company_id ||
      !formData.name ||
      !formData.email ||
      !formData.mobile ||
      !formData.user_type ||
      !formData.user_position
    ) {
      toast({
        title: "Error",
        description: "Please fill all fields",
        variant: "destructive",
      });
      return;
    }
    if (!emailRegex.test(formData.email)) {
      toast({
        title: "Error",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }

    if (formData.mobile.length !== 10) {
      toast({
        title: "Error",
        description: "Mobile number must be exactly 10 digits",
        variant: "destructive",
      });
      return;
    }
    setIsLoading(true);
    try {

      const response = await axios.post(
        `${BASE_URL}/api/panel-create-team`,
        formData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response?.data.code === 200) {
        toast({
          title: "Success",
          description: response.data.msg,
        });

        setFormData({
          company_id: "",
          name: "",
          email: "",
          mobile: "",
          user_type: "",
          user_position: "",
        });
        await queryClient.invalidateQueries(["teams"]);
        setOpen(false);
      } else {
        toast({
          title: "Error",
          description: response.data.msg,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to create Team",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {/* <Button variant="default" className="ml-2 bg-yellow-500 text-black hover:bg-yellow-100">
               <SquarePlus className="h-4 w-4" /> Customer
             </Button> */}

        {pathname === "/userManagement" ? (
          <Button
            variant="default"
            className={`ml-2 ${ButtonConfig.backgroundColor} ${ButtonConfig.hoverBackgroundColor} ${ButtonConfig.textColor}`}
          >
            <SquarePlus className="h-4 w-4" /> Team
          </Button>
        ) : //  <div>
        //    <BankCreate
        //      className={`ml-2 ${ButtonConfig.backgroundColor} ${ButtonConfig.hoverBackgroundColor} ${ButtonConfig.textColor}`}
        //    ></BankCreate>
        //  </div>
        pathname === "/create-contract" ? (
          <p className="text-xs text-yellow-700 ml-2 mt-1 w-32 hover:text-red-800 cursor-pointer">
            Create Team
          </p>
        ) : null}
      </DialogTrigger>

      <DialogContent className="sm:max-w-md" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>Create New Team</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {userId === "4" ? (
            <div className="grid gap-2">
              <Label htmlFor="company_id">Company</Label>
              <Select
                onValueChange={(value) =>
                  handleSelectChange(value, "company_id")
                }
                value={formData.company_id}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select company" />
                </SelectTrigger>
                <SelectContent>
                  {companiesData?.company?.map((company) => (
                    <SelectItem key={company.id} value={company.id.toString()}>
                      {company.company_name}
                    </SelectItem>
                  )) || <p>Loading...</p>}
                </SelectContent>
              </Select>
            </div>
          ) : (
            <div className="grid gap-2">
              <Label htmlFor="company_id">Company</Label>
              <Input
                id="company_id"
                name="company_id"
                value={formData.company_id}
                onChange={handleInputChange}
                placeholder="Enter Company"
              />
            </div>
          )}

          <div className="grid gap-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Enter name"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Enter email"
              pattern="^[^\s@]+@[^\s@]+\.[^\s@]+$"
              required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="mobile">Mobile</Label>
            <Input
              id="mobile"
              name="mobile"
              type="tel"
              value={formData.mobile}
              onChange={handleInputChange}
              placeholder="Enter mobile number"
              pattern="^\d{10}$"
              maxLength="10"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="user_position">User Position</Label>
            <Select
              onValueChange={(value) =>
                handleSelectChange(value, "user_position")
              }
              value={formData.user_position}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select position" />
              </SelectTrigger>
              <SelectContent>
                {userTypeData?.userType?.length > 0 ? (
                  userTypeData.userType.map((position, index) => (
                    <SelectItem key={index} value={position.user_position}>
                      {position.user_position}
                    </SelectItem>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 p-2">Loading...</p>
                )}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button
            onClick={handleSubmit}
            disabled={isLoading}
            className={`${ButtonConfig.backgroundColor} ${ButtonConfig.hoverBackgroundColor} ${ButtonConfig.textColor}`}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              "Create team"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateTeam;
