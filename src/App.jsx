import React, { useRef } from "react";
import { Card, CardTitle } from "@/components/ui/card"; 
import { CircleUserRound, House, KeyRound, Search, ChevronLeft, ChevronRight } from "lucide-react";

const featuredProperties = [
  {
    title: "Bahay ni Lei, BGC",
    subtitle: "Redefining High-End Apartments • ₱210,000/mo",
    images: [
      "https://rentalrealestate.com/wp-content/uploads/high-quality-real-estate-photography-accelerates-property-sales-and-increases-value.png",
      "https://thumbs.dreamstime.com/b/elegant-bedroom-design-featuring-large-windows-soft-beige-curtains-modern-furniture-cozy-ambience-ideal-real-estate-398400996.jpg",
      "https://2391de4ba78ae59a71f3-fe3f5161196526a8a7b5af72d4961ee5.ssl.cf3.rackcdn.com/cache/thumbnails/grosvenor-crescent-mews-de77f60e6a749647b49bb50bdc365c31.jpg",
    ],
  },
  {
    title: "Bahay ni Johann, BGC",
    subtitle: "3-Bedroom • 138 sqm High Floor • ₱150,000/mo",
    images: [
      "https://rentalrealestate.com/wp-content/uploads/high-quality-real-estate-photography-accelerates-property-sales-and-increases-value.png",
      "https://thumbs.dreamstime.com/b/elegant-bedroom-design-featuring-large-windows-soft-beige-curtains-modern-furniture-cozy-ambience-ideal-real-estate-398400996.jpg",
      "https://2391de4ba78ae59a71f3-fe3f5161196526a8a7b5af72d4961ee5.ssl.cf3.rackcdn.com/cache/thumbnails/grosvenor-crescent-mews-de77f60e6a749647b49bb50bdc365c31.jpg",
    ],
  },
  {
    title: "Bahay ni James, BGC",
    subtitle: "Cozy & Warm Modern Minimalist • ₱110,000/mo",
    images: [
      "https://rentalrealestate.com/wp-content/uploads/high-quality-real-estate-photography-accelerates-property-sales-and-increases-value.png",
      "https://thumbs.dreamstime.com/b/elegant-bedroom-design-featuring-large-windows-soft-beige-curtains-modern-furniture-cozy-ambience-ideal-real-estate-398400996.jpg",
      "https://2391de4ba78ae59a71f3-fe3f5161196526a8a7b5af72d4961ee5.ssl.cf3.rackcdn.com/cache/thumbnails/grosvenor-crescent-mews-de77f60e6a749647b49bb50bdc365c31.jpg",
    ],
  },

    {
    title: "Bahay ni Frank, BGC",
    subtitle: "3-Bedroom • 138 sqm High Floor • ₱150,000/mo",
    images: [
      "https://rentalrealestate.com/wp-content/uploads/high-quality-real-estate-photography-accelerates-property-sales-and-increases-value.png",
      "https://thumbs.dreamstime.com/b/elegant-bedroom-design-featuring-large-windows-soft-beige-curtains-modern-furniture-cozy-ambience-ideal-real-estate-398400996.jpg",
      "https://2391de4ba78ae59a71f3-fe3f5161196526a8a7b5af72d4961ee5.ssl.cf3.rackcdn.com/cache/thumbnails/grosvenor-crescent-mews-de77f60e6a749647b49bb50bdc365c31.jpg",
    ],
  },

    {
    title: "Bahay ni Angge, BGC",
    subtitle: "3-Bedroom • 138 sqm High Floor • ₱150,000/mo",
    images: [
      "https://rentalrealestate.com/wp-content/uploads/high-quality-real-estate-photography-accelerates-property-sales-and-increases-value.png",
      "https://thumbs.dreamstime.com/b/elegant-bedroom-design-featuring-large-windows-soft-beige-curtains-modern-furniture-cozy-ambience-ideal-real-estate-398400996.jpg",
      "https://2391de4ba78ae59a71f3-fe3f5161196526a8a7b5af72d4961ee5.ssl.cf3.rackcdn.com/cache/thumbnails/grosvenor-crescent-mews-de77f60e6a749647b49bb50bdc365c31.jpg",
    ],
  },

    {
    title: "Bahay ni Fitz, BGC",
    subtitle: "3-Bedroom • 138 sqm High Floor • ₱150,000/mo",
    images: [
      "https://rentalrealestate.com/wp-content/uploads/high-quality-real-estate-photography-accelerates-property-sales-and-increases-value.png",
      "https://thumbs.dreamstime.com/b/elegant-bedroom-design-featuring-large-windows-soft-beige-curtains-modern-furniture-cozy-ambience-ideal-real-estate-398400996.jpg",
      "https://2391de4ba78ae59a71f3-fe3f5161196526a8a7b5af72d4961ee5.ssl.cf3.rackcdn.com/cache/thumbnails/grosvenor-crescent-mews-de77f60e6a749647b49bb50bdc365c31.jpg",
    ],
  },

  
];



export default function App() {
  const carouselRefs = useRef([]);

  const scrollLeft = (index) => {
    if (carouselRefs.current[index]) {
      carouselRefs.current[index].scrollBy({ left: -300, behavior: "smooth" });
    }
  };

  const scrollRight = (index) => {
    if (carouselRefs.current[index]) {
      carouselRefs.current[index].scrollBy({ left: 300, behavior: "smooth" });
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-blue-800 shadow-md">
        <div className="flex items-center justify-between px-4 py-3 md:px-6">
          <div className="rounded-lg">
            <h1 className="font-bold text-2xl md:text-3xl drop-shadow-lg text-white">
              Real Estate
            </h1>
          </div>
          <div className="hidden md:flex flex-row gap-6 text-white font-medium">
            <a href="" className="hover:underline">Link</a>
            <a href="" className="hover:underline">Link</a>
            <a href="" className="hover:underline">Link</a>
          </div>
          <div>
            <CircleUserRound className="h-7 w-7 text-white" />
          </div>
        </div>
      </nav>

      <div className="relative h-screen w-full overflow-hidden">
        <img
          src="/src/assets/wow.jpg" // ← keep or replace with real hero image
          className="w-full h-full object-cover"
          alt="featured"
        />
        <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-white to-transparent" />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 z-10">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 text-white [text-shadow:_0_0_10px_rgba(0,0,0,0.9),_0_0_20px_rgba(0,0,0,0.7),_0_0_30px_rgba(0,0,0,0.5)]">
            Real Estate ng Horizon Dev
          </h2>
          <p className="text-lg md:text-xl lg:text-2xl max-w-3xl mb-8 text-white [text-shadow:_0_0_8px_rgba(0,0,0,0.9),_0_0_16px_rgba(0,0,0,0.7),_0_0_24px_rgba(0,0,0,0.5)]">
            dito description sa susunod nalang lagyan boss
          </p>
          <div className="w-full max-w-4xl bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl p-6 md:p-8">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price Range
                </label>
                <input
                  type="range"
                  min="0"
                  max="1500000"
                  defaultValue="750000"
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
                <div className="flex justify-between text-sm text-gray-600 mt-2">
                  <span>₱0</span>
                  <span>₱1,500,000</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location
                </label>
                <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white">
                  <option>Any</option>
                  <option>Ortigas Ave, Pasig</option>
                  <option>Antipolo</option>
                  <option>Uptown</option>
                  <option>Mandaluyong</option>
                  <option>Other Areas</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Purpose
                </label>
                <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white">
                  <option>Any</option>
                  <option>For Sale</option>
                  <option>For Rent</option>
                  <option>Investment</option>
                </select>
              </div>
            </div>
            <div className="mt-8 text-center">
              <button className="bg-blue-800 text-white px-12 py-4 rounded-lg font-medium hover:bg-blue-900 transition text-lg shadow-md">
                Search Properties
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 mt-12 md:mt-16 mb-16">
        <div className="text-center p-6 md:p-8 bg-white/60 backdrop-blur-sm rounded-xl border border-gray-200 shadow-sm hover:shadow-lg transition">
          <House className="h-20 w-20 mx-auto mb-4 text-blue-700" />
          <h3 className="text-xl font-semibold mb-3">Hundreds of Listings</h3>
          <p className="text-gray-700 text-sm md:text-base">
            dito description sa susunod nalang lagyan boss
          </p>
        </div>
        <div className="text-center p-6 md:p-8 bg-white/60 backdrop-blur-sm rounded-xl border border-gray-200 shadow-sm hover:shadow-lg transition">
          <KeyRound className="h-20 w-20 mx-auto mb-4 text-blue-700" />
          <h3 className="text-xl font-semibold mb-3">Relocation Support</h3>
          <p className="text-gray-700 text-sm md:text-base">
            dito description sa susunod nalang lagyan boss
          </p>
        </div>
        <div className="text-center p-6 md:p-8 bg-white/60 backdrop-blur-sm rounded-xl border border-gray-200 shadow-sm hover:shadow-lg transition">
          <Search className="h-20 w-20 mx-auto mb-4 text-blue-700" />
          <h3 className="text-xl font-semibold mb-3">Dedicated Concierge</h3>
          <p className="text-gray-700 text-sm md:text-base">
            dito description sa susunod nalang lagyan boss
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 py-12 md:py-16">
        <CardTitle className="text-center font-bold text-3xl mb-8 text-gray-800">
          Featured Properties
        </CardTitle>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-12">
          {featuredProperties.map((property, index) => (
            <div key={index} className="space-y-4">
              <div className="relative rounded-2xl overflow-hidden shadow-xl group">
                <div
                  ref={(el) => (carouselRefs.current[index] = el)}
                  className="flex overflow-x-auto snap-x snap-mandatory scroll-smooth gap-0 scrollbar-hide"
                >
                  {property.images.map((imgSrc, imgIdx) => (
                    <img
                      key={imgIdx}
                      src={imgSrc}
                      className="flex-shrink-0 w-full h-[340px] md:h-[420px] object-cover snap-center"
                      alt={`${property.title} ${imgIdx + 1}`}
                    />
                  ))}
                </div>
                <button
                  onClick={() => scrollLeft(index)}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 text-white p-3 rounded-full hover:bg-black/70 transition"
                >
                  <ChevronLeft size={28} />
                </button>
                <button
                  onClick={() => scrollRight(index)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 text-white p-3 rounded-full hover:bg-black/70 transition"
                >
                  <ChevronRight size={28} />
                </button>
              </div>
              <h3 className="text-xl font-bold text-gray-800 text-center mt-4">
                {property.title}
              </h3>
              <p className="text-gray-600 text-center text-sm">
                {property.subtitle}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}