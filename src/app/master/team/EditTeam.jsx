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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import axios from "axios";
import BASE_URL from "@/config/BaseUrl";
import { Edit, Loader2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { ButtonConfig } from "@/config/ButtonConfig";

const EditTeam = ({ teamId }) => {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    mobile: "",
    email: "",
    name: "",
    status: "Active",
  });

  const fetchTeamData = async () => {
    setIsFetching(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${BASE_URL}/api/panel-fetch-team-by-id/${teamId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const teamData = response.data.team;
      setFormData({
        mobile: teamData.mobile,
        email: teamData.email,

        status: teamData.status,
        name: teamData.name,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch bank data",
        variant: "destructive",
      });
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchTeamData();
    }
  }, [open]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleStatusChange = (value) => {
    setFormData((prev) => ({
      ...prev,
      status: value,
    }));
  };

  const handleSubmit = async () => {
    if (!formData.mobile || !formData.email || !formData.status) {
      toast({
        title: "Error",
        description: "Please fill all fields",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.put(
        `${BASE_URL}/api/panel-update-team/${teamId}`,
        formData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response?.data.code == 200) {
        toast({
          title: "Success",
          description: response.data.msg,
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
        description: error.response?.data?.message || "Failed to update Team",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {/* <DialogTrigger asChild>
              <Button variant="ghost" size="icon">
                <Edit className="h-4 w-4" />
              </Button>
            </DialogTrigger> */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className={`transition-all duration-200 ${
                  isHovered ? "bg-blue-50" : ""
                }`}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
              >
                <Edit
                  className={`h-4 w-4 transition-all duration-200 ${
                    isHovered ? "text-blue-500" : ""
                  }`}
                />
              </Button>
              {/* <BankEdit
                   onMouseEnter={() => setIsHovered(true)}
                   onMouseLeave={() => setIsHovered(false)}
                 ></BankEdit> */}
            </DialogTrigger>
          </TooltipTrigger>
          <TooltipContent>
            <p>Edit Team</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Team - <span className="text-2xl">{formData.name}</span></DialogTitle>
        </DialogHeader>

        {isFetching ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : (
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="mobile">Mobile</Label>
              <Input
                id="mobile"
                name="mobile"
                value={formData.mobile}
                onChange={handleInputChange}
                placeholder="Enter mobile"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Enter email "
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={handleStatusChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button
            onClick={handleSubmit}
            disabled={isLoading || isFetching}
            className={`${ButtonConfig.backgroundColor} ${ButtonConfig.hoverBackgroundColor} ${ButtonConfig.textColor}`}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating...
              </>
            ) : (
              "Update Bank"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditTeam;
