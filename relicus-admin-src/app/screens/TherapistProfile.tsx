import { useNavigate, useParams } from "react-router";
import { motion } from "motion/react";
import { ArrowLeft, Star, MapPin, Languages, Award, Calendar } from "lucide-react";
import { Button } from "../components/Button";
import { Card } from "../components/Card";

export function TherapistProfile() {
  const navigate = useNavigate();
  const { id } = useParams();

  const therapist = {
    name: "Dr. Sarah Johnson",
    photo: "SJ",
    experience: "12 years",
    rating: 4.9,
    reviews: 234,
    specialization: ["Anxiety Disorders", "Depression", "Trauma", "PTSD"],
    about: "Dr. Sarah Johnson is a licensed clinical psychologist with over 12 years of experience helping individuals overcome mental health challenges. She specializes in evidence-based therapies including CBT and EMDR.",
    languages: ["English", "Hindi", "Spanish"],
    fee: "₹1,500",
    location: "Mumbai, India",
    education: "PhD in Clinical Psychology, Harvard University",
    availability: ["Mon", "Wed", "Fri", "Sat"],
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="bg-gradient-to-br from-primary to-secondary p-6 pb-32 rounded-b-[2rem]">
        <button
          onClick={() => navigate("/app/counselling")}
          className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm mb-6"
        >
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>

        <div className="flex flex-col items-center">
          <div className="w-32 h-32 bg-white rounded-3xl flex items-center justify-center text-primary text-4xl font-bold shadow-2xl mb-4">
            {therapist.photo}
          </div>
          <h1 className="text-2xl font-bold text-white mb-1">{therapist.name}</h1>
          <p className="text-white/80 mb-3">{therapist.experience} experience</p>
          <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
            <Star className="w-5 h-5 fill-warning text-warning" />
            <span className="text-white font-semibold">{therapist.rating}</span>
            <span className="text-white/80">({therapist.reviews} reviews)</span>
          </div>
        </div>
      </div>

      <div className="px-6 -mt-24 space-y-4">
        <Card>
          <h3 className="font-semibold text-foreground mb-3">About</h3>
          <p className="text-muted-foreground text-sm leading-relaxed">
            {therapist.about}
          </p>
        </Card>

        <Card>
          <h3 className="font-semibold text-foreground mb-3">Specialization</h3>
          <div className="flex flex-wrap gap-2">
            {therapist.specialization.map((spec) => (
              <span
                key={spec}
                className="px-3 py-1 bg-accent/20 text-primary text-sm rounded-full"
              >
                {spec}
              </span>
            ))}
          </div>
        </Card>

        <Card>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-accent/20 rounded-xl flex items-center justify-center">
                <Languages className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Languages</p>
                <p className="font-medium text-foreground">{therapist.languages.join(", ")}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-accent/20 rounded-xl flex items-center justify-center">
                <Award className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Education</p>
                <p className="font-medium text-foreground">{therapist.education}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-accent/20 rounded-xl flex items-center justify-center">
                <MapPin className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Location</p>
                <p className="font-medium text-foreground">{therapist.location}</p>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <h3 className="font-semibold text-foreground mb-3">Availability</h3>
          <div className="flex gap-2">
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
              <div
                key={day}
                className={`flex-1 py-2 text-center rounded-xl text-sm font-medium ${
                  therapist.availability.includes(day)
                    ? "bg-secondary text-white"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {day}
              </div>
            ))}
          </div>
        </Card>

        <div className="flex items-center justify-between bg-gradient-to-r from-primary to-secondary p-4 rounded-2xl">
          <div className="text-white">
            <p className="text-sm opacity-90">Session Fee</p>
            <p className="text-2xl font-bold">{therapist.fee}</p>
          </div>
          <Button
            onClick={() => navigate(`/app/counselling/${id}/book`)}
            className="bg-white text-primary hover:bg-white/90"
            size="lg"
          >
            Book Session
          </Button>
        </div>
      </div>
    </div>
  );
}
