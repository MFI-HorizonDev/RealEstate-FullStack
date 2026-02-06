import React from "react";
import {
  Card,
  CardContent,
  CardTitle,
} from "@/components/ui/card";
import { CircleUserRound } from "lucide-react";

export default function App() {
  return (
    <>
      <div className="flex min-h-screen flex-col">
        {/* NAVBAR */}
        <nav>
          <div className="w-full flex items-center justify-between bg-blue-800">
            <div className="rounded-lg p-2">
              <h1 className="font-bold text-3xl drop-shadow-lg text-white pl-3 py-2">
                Real Estate
              </h1>
            </div>

            <div className="flex flex-row gap-5 text-white">
              <h1>Link</h1>
              <h1>Link</h1>
              <h1>Link</h1>
            </div>

            <div>
              <CircleUserRound className="h-6 w-6 text-white mr-4" />
            </div>
          </div>
        </nav>

        {/* HERO IMAGE WITH SUBTLE FADE */}
        <div className="relative h-screen w-full overflow-hidden">
          <img
            src="/src/assets/wow.jpg"
            className="w-full h-full object-cover"
            alt="featured"
          />

          {/* SOFT BOTTOM FADE */}
          <div className="absolute bottom-0 left-0 w-full h-90 bg-gradient-to-t from-white/100 to-transparent" />
        </div>

        {/* BOX SECTION */}
        <div className="flex flex-row justify-between items-center m-7">
          <div className="size-40 bg-gray-300"></div>
          <div className="size-40 bg-gray-400"></div>
          <div className="size-40 bg-orange-400"></div>
        </div>

        {/* CARD SECTION */}
        <Card className="bg-gray-200 rounded-lg p-4 text-black m-5">
          <CardTitle className="text-center font-bold text-3xl">
            bili na raw kayo
          </CardTitle>

          <CardContent className="flex flex-row flex-wrap gap-4 p-5 justify-center">
            <img
              src="/src/assets/lol.jpg"
              className="w-64 h-40 object-cover rounded-lg"
              alt="property-1"
            />
            <img
              src="/src/assets/isa.jpg"
              className="w-64 h-40 object-cover rounded-lg"
              alt="property-2"
            />
            <img
              src="/src/assets/ye.jpg"
              className="w-64 h-40 object-cover rounded-lg"
              alt="property-3"
            />
          </CardContent>
        </Card>
      </div>
    </>
  );
}
