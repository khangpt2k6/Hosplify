import React, { useContext, useEffect, useState } from "react";
import { AppContext } from "../context/AppContext";
import { useNavigate, useParams } from "react-router-dom";
import {
  Filter,
  Search,
  User,
  MapPin,
  Clock,
  ChevronRight,
} from "lucide-react";

const Doctors = () => {
  const { speciality } = useParams();
  const [filterDoc, setFilterDoc] = useState([]);
  const [showFilter, setShowFilter] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  const { doctors } = useContext(AppContext);

  const specialties = [
    "General physician",
    "Gynecologist",
    "Dermatologist",
    "Pediatricians",
    "Neurologist",
    "Gastroenterologist",
  ];

  const applyFilter = () => {
    let filtered = doctors;

    if (speciality) {
      filtered = doctors.filter((doc) => doc.speciality === speciality);
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (doc) =>
          doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          doc.speciality.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilterDoc(filtered);
  };

  useEffect(() => {
    applyFilter();
  }, [doctors, speciality, searchTerm]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header Section */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          Find Your Specialist
        </h1>
        <p className="text-gray-600">
          Browse through our network of qualified medical specialists
        </p>
      </div>

      {/* Search Bar */}
      <div className="relative mb-8">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          placeholder="Search by doctor name or specialty..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Filter Section */}
        <div className="lg:w-64 flex-shrink-0">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-800 flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Specialties
            </h2>
            <button
              onClick={() => setShowFilter(!showFilter)}
              className="lg:hidden flex items-center gap-1 text-primary font-medium"
            >
              {showFilter ? "Hide" : "Show"}
              <ChevronRight
                className={`h-4 w-4 transition-transform ${
                  showFilter ? "rotate-90" : ""
                }`}
              />
            </button>
          </div>

          <div
            className={`space-y-2 ${showFilter ? "block" : "hidden lg:block"}`}
          >
            {specialties.map((spec, index) => (
              <div
                key={index}
                onClick={() =>
                  spec === speciality
                    ? navigate("/doctors")
                    : navigate(`/doctors/${spec}`)
                }
                className={`
                  p-3 rounded-lg cursor-pointer transition-all flex items-center
                  ${
                    speciality === spec
                      ? "bg-primary text-white shadow-md"
                      : "bg-white hover:bg-gray-50 text-gray-700 border border-gray-200"
                  }
                `}
              >
                <div className="flex-1">{spec}</div>
                {speciality === spec && (
                  <div className="h-2 w-2 rounded-full bg-white"></div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Doctors Grid */}
        <div className="flex-1">
          {filterDoc.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 bg-gray-50 rounded-xl">
              <User className="h-16 w-16 text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-700">
                No doctors found
              </h3>
              <p className="text-gray-500 text-center">
                Try adjusting your search or filter criteria
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filterDoc.map((doctor, index) => (
                <div
                  key={index}
                  onClick={() => {
                    navigate(`/appointment/${doctor._id}`);
                    scrollTo(0, 0);
                  }}
                  className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer group"
                >
                  <div className="relative h-48 overflow-hidden">
                    <img
                      className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                      src={doctor.image}
                      alt={doctor.name}
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                      <div
                        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                          doctor.available
                            ? "bg-green-500 text-white"
                            : "bg-gray-500 text-white"
                        }`}
                      >
                        <span
                          className={`w-2 h-2 rounded-full ${
                            doctor.available ? "bg-white" : "bg-gray-200"
                          }`}
                        ></span>
                        {doctor.available ? "Available now" : "Not Available"}
                      </div>
                    </div>
                  </div>

                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-gray-800 mb-1 group-hover:text-primary transition-colors">
                      {doctor.name}
                    </h3>

                    <div className="flex items-center text-gray-500 text-sm mb-3">
                      <MapPin className="h-4 w-4 mr-1" />
                      <span>{doctor.speciality}</span>
                    </div>

                    <div className="flex items-center justify-end pt-3 border-t border-gray-100">
                      <div className="flex items-center text-gray-500 text-sm">
                        <Clock className="h-4 w-4 mr-1" />
                        <span>Next: Today</span>
                      </div>
                    </div>
                  </div>

                  <div className="px-4 pb-4">
                    <button
                      className="w-full py-2 bg-primary/10 text-primary font-medium rounded-lg hover:bg-primary hover:text-white transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/appointment/${doctor._id}`);
                        scrollTo(0, 0);
                      }}
                    >
                      Book Appointment
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Doctors;
