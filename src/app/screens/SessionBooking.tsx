import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { ArrowLeft, Check, Video, MessageSquare, Phone } from "lucide-react";
import { Button } from "../components/Button";
import { Card } from "../components/Card";

export function SessionBooking() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [selectedDate, setSelectedDate] = useState<number | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [sessionType, setSessionType] = useState<"video" | "chat" | "phone">("video");
  const [showConfirmation, setShowConfirmation] = useState(false);

  const dates = [
    { day: "Mon", date: 15 },
    { day: "Tue", date: 16 },
    { day: "Wed", date: 17 },
    { day: "Thu", date: 18 },
    { day: "Fri", date: 19 },
    { day: "Sat", date: 20 },
  ];

  const times = [
    "09:00 AM", "10:00 AM", "11:00 AM",
    "02:00 PM", "03:00 PM", "04:00 PM",
    "05:00 PM", "06:00 PM"
  ];

  const sessionTypes = [
    { type: "video" as const, label: "Video Call", icon: Video },
    { type: "chat" as const, label: "Chat", icon: MessageSquare },
    { type: "phone" as const, label: "Phone Call", icon: Phone },
  ];

  const handleBooking = () => {
    setShowConfirmation(true);
    setTimeout(() => {
      navigate("/app/sessions");
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="bg-gradient-to-br from-primary to-secondary p-6 pb-8">
        <div className="flex items-center gap-4 mb-4">
          <button
            onClick={() => navigate(`/app/counselling/${id}`)}
            className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <h1 className="text-2xl font-bold text-white">Book Session</h1>
        </div>
      </div>

      <div className="px-6 -mt-4 space-y-6">
        <Card>
          <h3 className="font-semibold text-foreground mb-4">Select Date</h3>
          <div className="grid grid-cols-6 gap-2">
            {dates.map((item) => (
              <button
                key={item.date}
                onClick={() => setSelectedDate(item.date)}
                className={`py-3 rounded-xl text-center transition-all ${
                  selectedDate === item.date
                    ? "bg-primary text-white shadow-lg"
                    : "bg-muted text-foreground hover:bg-accent/20"
                }`}
              >
                <p className="text-xs mb-1">{item.day}</p>
                <p className="font-semibold">{item.date}</p>
              </button>
            ))}
          </div>
        </Card>

        <Card>
          <h3 className="font-semibold text-foreground mb-4">Select Time</h3>
          <div className="grid grid-cols-3 gap-2">
            {times.map((time) => (
              <button
                key={time}
                onClick={() => setSelectedTime(time)}
                className={`py-3 rounded-xl text-sm font-medium transition-all ${
                  selectedTime === time
                    ? "bg-secondary text-white shadow-lg"
                    : "bg-muted text-foreground hover:bg-accent/20"
                }`}
              >
                {time}
              </button>
            ))}
          </div>
        </Card>

        <Card>
          <h3 className="font-semibold text-foreground mb-4">Session Type</h3>
          <div className="grid grid-cols-3 gap-3">
            {sessionTypes.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.type}
                  onClick={() => setSessionType(item.type)}
                  className={`p-4 rounded-xl flex flex-col items-center gap-2 transition-all ${
                    sessionType === item.type
                      ? "bg-accent text-primary border-2 border-primary"
                      : "bg-muted text-foreground border-2 border-transparent"
                  }`}
                >
                  <Icon className="w-6 h-6" />
                  <span className="text-xs font-medium">{item.label}</span>
                </button>
              );
            })}
          </div>
        </Card>

        <Card className="bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/20">
          <h3 className="font-semibold text-foreground mb-3">Payment Summary</h3>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Session Fee</span>
              <span className="font-semibold">₹1,500</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Platform Fee</span>
              <span className="font-semibold">₹50</span>
            </div>
            <div className="border-t border-border pt-2 mt-2 flex justify-between">
              <span className="font-semibold">Total</span>
              <span className="text-xl font-bold text-primary">₹1,550</span>
            </div>
          </div>
        </Card>

        <Button
          onClick={handleBooking}
          disabled={!selectedDate || !selectedTime}
          className="w-full"
          size="lg"
        >
          Book Appointment
        </Button>
      </div>

      <AnimatePresence>
        {showConfirmation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-white rounded-3xl p-8 max-w-sm w-full text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
                className="w-20 h-20 bg-success rounded-full flex items-center justify-center mx-auto mb-4"
              >
                <Check className="w-10 h-10 text-white" strokeWidth={3} />
              </motion.div>
              <h3 className="text-2xl font-bold text-foreground mb-2">Booking Confirmed!</h3>
              <p className="text-muted-foreground">
                Your session has been successfully booked. You'll receive a confirmation shortly.
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
