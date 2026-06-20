import { useState } from "react";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import { Search, SlidersHorizontal, Star, ArrowLeft } from "lucide-react";
import { Card } from "../components/Card";
import { Button } from "../components/Button";
import { Input } from "../components/Input";

export function CounsellingListing() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const therapists = [
    {
      id: 1,
      name: "Dr. Sarah Johnson",
      photo: "SJ",
      experience: "12 years",
      rating: 4.9,
      reviews: 234,
      specialization: "Anxiety, Depression, Trauma",
      fee: "₹1,500",
      available: true,
    },
    {
      id: 2,
      name: "Dr. Rajesh Kumar",
      photo: "RK",
      experience: "8 years",
      rating: 4.8,
      reviews: 187,
      specialization: "Stress, Relationships",
      fee: "₹1,200",
      available: true,
    },
    {
      id: 3,
      name: "Dr. Priya Sharma",
      photo: "PS",
      experience: "15 years",
      rating: 5.0,
      reviews: 312,
      specialization: "Family Therapy, Addiction",
      fee: "₹2,000",
      available: false,
    },
    {
      id: 4,
      name: "Dr. Michael Chen",
      photo: "MC",
      experience: "10 years",
      rating: 4.7,
      reviews: 156,
      specialization: "CBT, Mindfulness",
      fee: "₹1,800",
      available: true,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-gradient-to-br from-primary to-secondary p-6 pb-8">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate("/app")}
            className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <h1 className="text-2xl font-bold text-white flex-1">Find a Therapist</h1>
        </div>

        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search therapists..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white rounded-xl focus:outline-none focus:ring-2 focus:ring-white/50"
            />
          </div>
          <button className="w-12 h-12 bg-white rounded-xl flex items-center justify-center">
            <SlidersHorizontal className="w-5 h-5 text-primary" />
          </button>
        </div>
      </div>

      <div className="p-6 space-y-4 -mt-4">
        {therapists.map((therapist, index) => (
          <motion.div
            key={therapist.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="p-4">
              <div className="flex gap-4">
                <div className="w-20 h-20 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
                  {therapist.photo}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground">{therapist.name}</h3>
                      <p className="text-sm text-muted-foreground">{therapist.experience} experience</p>
                    </div>
                    <div className="flex items-center gap-1 bg-accent/20 px-2 py-1 rounded-lg">
                      <Star className="w-4 h-4 fill-warning text-warning" />
                      <span className="text-sm font-semibold">{therapist.rating}</span>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2 line-clamp-1">
                    {therapist.specialization}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-primary">{therapist.fee}/session</span>
                    <Button
                      size="sm"
                      onClick={() => navigate(`/app/counselling/${therapist.id}`)}
                      disabled={!therapist.available}
                    >
                      {therapist.available ? "Book Now" : "Unavailable"}
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
