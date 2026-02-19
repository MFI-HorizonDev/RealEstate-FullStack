import React from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router";

export default function Notfound() {

  const navigate = useNavigate()
  const navigation = ()=>{
    navigate("/")
  }
  
  return (
    <>
      <div className="flex min-h-screen items-center justify-center font-bold gap-5 flex-col bg-blue-800 text-white"
      >
          <h1 style={{ textAlign: "center" }}>
            <span style={{ fontSize: 80 }}>
              404
              <br />
            </span>
            Page Not Found, SoOoOrRyY~
          </h1>
        <Button onClick={navigation} className="bg-amber-900"> Go Back</Button>
        
      </div>
    <div className="absolute bottom-0 left-0 w-full h-80 bg-gradient-to-t from-white/30 to-transparent" />
    </>
  );
}