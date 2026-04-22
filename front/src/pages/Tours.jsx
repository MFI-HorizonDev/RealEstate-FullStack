import React from "react";
import { useDeleteTour, useTours, useTourAgentAction, useUpdateTour } from "@/services/api/useTours";
import { useAuth } from "@/services/api/useAuth";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle, 
  CardFooter 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  CalendarDays, 
  User, 
  MapPin 
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export default function Tours() {
  const { user, isLoggedIn, isLoading, isError, error } = useAuth();
  const { data: tours = [], isLoading: loadingTours } = useTours({ enabled: isLoggedIn });
  const { mutate: updateTourStatus, isPending: isUpdating } = useTourAgentAction();
  const { mutate: updateTour, isPending: isManaging } = useUpdateTour();
  const { mutate: deleteTour, isPending: isDeleting } = useDeleteTour();
  const [editingTourId, setEditingTourId] = React.useState(null);
  const [editDate, setEditDate] = React.useState("");
  const [editTime, setEditTime] = React.useState("");

  const isAdmin = user?.groups?.includes("Admin") || 
                  user?.groups?.includes("SuperAdmin") || 
                  user?.groups?.includes("Super Admin") || 
                  user?.is_superuser;
  const isAgent = user?.groups?.includes("Agent");

  if (!isLoggedIn) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">My Tours</h2>
        <p className="text-gray-500">Please log in to view your tours.</p>
      </div>
    );
  }

  const handleAction = (id, status) => {
    const actionLabel = status === "SCHEDULED" ? "Accepting" : "Rejecting";
    const promise = new Promise((resolve, reject) => {
      updateTourStatus(
        { id, status },
        {
          onSuccess: (data) => resolve(data),
          onError: (err) => reject(err),
        }
      );
    });

    toast.promise(promise, {
      loading: `${actionLabel} tour...`,
      success: `Tour ${status.toLowerCase()} successfully!`,
      error: (err) => {
        // Extract nested error messages from DRF
        const msg = err.data?.status || err.data?.non_field_errors || err.message || "Action failed";
        return `Failed: ${msg}`;
      },
    });
  };

  const handleComplete = (id) => {
    updateTour({ id, data: { status: "COMPLETED" } });
  };

  const handleDelete = (id) => {
    deleteTour(id);
  };

  const openEditSchedule = (tour) => {
    const dt = tour?.tour_datetime ? new Date(tour.tour_datetime) : new Date();
    const yyyy = dt.getFullYear();
    const mm = String(dt.getMonth() + 1).padStart(2, "0");
    const dd = String(dt.getDate()).padStart(2, "0");
    const hh = String(dt.getHours()).padStart(2, "0");
    const min = String(dt.getMinutes()).padStart(2, "0");
    setEditingTourId(tour.id);
    setEditDate(`${yyyy}-${mm}-${dd}`);
    setEditTime(`${hh}:${min}`);
  };

  const saveSchedule = () => {
    if (!editingTourId || !editDate || !editTime) return;
    const iso = new Date(`${editDate}T${editTime}`).toISOString();
    updateTour(
      { id: editingTourId, data: { tour_datetime: iso } },
      {
        onSuccess: () => {
          setEditingTourId(null);
          setEditDate("");
          setEditTime("");
          toast.success("Tour schedule updated.");
        },
        onError: (err) => toast.error(err?.message || "Failed to update schedule."),
      }
    );
  };


  const getStatusColor = (status) => {
    switch (status) {
      case "SCHEDULED": return "bg-green-100 text-green-800 border-green-200";
      case "QUEUED": return "bg-amber-100 text-amber-800 border-amber-200";
      case "COMPLETED": return "bg-blue-100 text-blue-800 border-blue-200";
      case "REJECTED": return "bg-red-100 text-red-800 border-red-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-8">
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold mb-2 text-gray-900">Property Tours</h1>
          <p className="text-gray-500">Manage your scheduled property viewings</p>
        </div>
      </div>

      {isLoading && (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-800"></div>
        </div>
      )}

      {isError && (
        <div className="bg-red-50 text-red-700 p-4 rounded-lg border border-red-100 mb-8">
          Failed to load tours: {error?.message || "Unknown error"}
        </div>
      )}

      {Array.isArray(tours) && tours.length === 0 && !isLoading && (
        <div className="text-center py-20 bg-white rounded-xl border border-gray-100 shadow-sm">
          <CalendarDays className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900">No tours found</h3>
          <p className="text-gray-500 mt-1">You don't have any tours scheduled or queued yet.</p>
        </div>
      )}

      {Array.isArray(tours) && tours.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {tours.map((tour) => {
            const dateText = tour.tour_datetime
              ? new Date(tour.tour_datetime).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })
              : "Not scheduled";

            return (
              <Card key={tour.id} className="overflow-hidden border border-gray-200 hover:shadow-xl transition-all duration-300 bg-white flex flex-col group">
                <CardHeader className="bg-gray-50 group-hover:bg-blue-50/30 border-b border-gray-100 pb-4 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <Badge variant="outline" className={`${getStatusColor(tour.status)} font-bold tracking-wide`}>
                      {tour.status}
                    </Badge>
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Tour ID #{tour.id}</span>
                  </div>
                  <CardTitle className="text-xl text-gray-900 leading-tight">
                    {tour.property_details?.property_name || `Property #${tour.property}`}
                  </CardTitle>
                  <CardDescription className="flex items-center gap-1 text-gray-500 mt-1">
                    <MapPin className="w-3.5 h-3.5" />
                    <span className="truncate">{tour.property_details?.property_address || "Address not available"}</span>
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-5 pt-6 flex-grow">
                  <div className="flex items-start gap-3">
                    <div className="bg-blue-50 p-2 rounded-lg text-blue-800">
                      <CalendarDays className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-tighter">Viewing Schedule</p>
                      <p className="text-gray-900 font-bold">{dateText}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-4 pt-2 border-t border-gray-50">
                    <div className="flex items-center gap-3">
                      <div className="bg-gray-50 p-2 rounded-lg text-gray-400">
                        <User className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Involved Parties</p>
                        <div className="flex flex-col gap-1 mt-1">
                          <div className="flex justify-between text-xs">
                            <span className="text-gray-500">Agent:</span>
                            <span className="font-bold text-gray-900">
                              {tour.agent_details ? `${tour.agent_details.first_name} ${tour.agent_details.last_name}` : "Unassigned"}
                            </span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-gray-500">Client:</span>
                            <span className="font-bold text-gray-900">
                              {tour.buyer_details ? `${tour.buyer_details.first_name} ${tour.buyer_details.last_name}` : "N/A"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {(isAdmin || isAgent) && editingTourId === tour.id && (
                    <div className="rounded-lg border border-blue-100 bg-blue-50 p-3 space-y-3">
                      <p className="text-xs font-bold uppercase tracking-wider text-blue-800">Edit Schedule</p>
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="date"
                          value={editDate}
                          onChange={(e) => setEditDate(e.target.value)}
                          className="rounded border border-blue-200 px-2 py-1 text-sm"
                        />
                        <input
                          type="time"
                          value={editTime}
                          onChange={(e) => setEditTime(e.target.value)}
                          className="rounded border border-blue-200 px-2 py-1 text-sm"
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          className="bg-blue-700 hover:bg-blue-800 text-white"
                          disabled={isManaging}
                          onClick={saveSchedule}
                        >
                          Save
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEditingTourId(null)}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
                
                {tour.status === "QUEUED" && (isAdmin || isAgent) && (
                  <CardFooter className="bg-gray-50/50 border-t border-gray-100 p-4 gap-3">
                    <Button 
                      onClick={() => handleAction(tour.id, "SCHEDULED")}
                      disabled={isUpdating}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold h-10 shadow-sm transition-transform active:scale-95"
                    >
                      Accept
                    </Button>
                    <Button 
                      onClick={() => handleAction(tour.id, "REJECTED")}
                      disabled={isUpdating}
                      variant="outline" 
                      className="flex-1 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 font-bold h-10 transition-transform active:scale-95"
                    >
                      Reject
                    </Button>
                    <Button
                      onClick={() => openEditSchedule(tour)}
                      disabled={isManaging}
                      variant="outline"
                      className="flex-1 border-blue-200 text-blue-700 hover:bg-blue-50 font-bold h-10"
                    >
                      Edit Time
                    </Button>
                  </CardFooter>
                )}

                {tour.status === "SCHEDULED" && (isAdmin || isAgent) && (
                  <CardFooter className="bg-gray-50/50 border-t border-gray-100 p-4 gap-3">
                    <Button
                      onClick={() => handleComplete(tour.id)}
                      disabled={isManaging}
                      className="flex-1 bg-blue-700 hover:bg-blue-800 text-white font-bold h-10"
                    >
                      Mark Completed
                    </Button>
                    <Button
                      onClick={() => handleDelete(tour.id)}
                      disabled={isDeleting}
                      variant="outline"
                      className="flex-1 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 font-bold h-10"
                    >
                      Delete
                    </Button>
                    <Button
                      onClick={() => openEditSchedule(tour)}
                      disabled={isManaging}
                      variant="outline"
                      className="flex-1 border-blue-200 text-blue-700 hover:bg-blue-50 font-bold h-10"
                    >
                      Edit Time
                    </Button>
                  </CardFooter>
                )}


                {tour.status === "SCHEDULED" && (
                   <CardFooter className="bg-gray-50/50 border-t border-gray-100 p-4">
                     <Button 
                        variant="secondary" 
                        className="w-full font-bold text-blue-800"
                        onClick={() => window.open(`https://maps.google.com/?q=${tour.property_details?.property_address}`, '_blank')}
                      >
                       Get Directions
                     </Button>
                   </CardFooter>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {Array.isArray(tours) && tours.length > 0 && (
        <Card className="relative bg-blue-900 text-white border-0 shadow-xl overflow-hidden">
          <div className="absolute inset-0 pointer-events-none bg-[url('/src/assets/bg.jpg')] opacity-10 bg-cover bg-center mix-blend-overlay"></div>
          <CardHeader className="relative z-10">
            <CardTitle className="text-white text-xl">Overview</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-6 relative z-10">
            <div>
              <p className="text-4xl font-bold text-white mb-1">{tours.length}</p>
              <p className="text-sm text-blue-200 font-medium uppercase tracking-wider">Total Tours</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-white mb-1">
                {tours.filter((t) => t.status === "QUEUED").length}
              </p>
              <p className="text-sm text-amber-300 font-medium uppercase tracking-wider">Queued</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-white mb-1">
                {tours.filter((t) => t.status === "SCHEDULED").length}
              </p>
              <p className="text-sm text-green-300 font-medium uppercase tracking-wider">Scheduled</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-white mb-1">
                {tours.filter((t) => t.status === "COMPLETED").length}
              </p>
              <p className="text-sm text-blue-200 font-medium uppercase tracking-wider">Completed</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
