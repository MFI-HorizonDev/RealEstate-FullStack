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
            Page Not Found
          </h1>
        <Button onClick={navigation} className="bg-amber-900"> Go Back</Button>
      </div>
    </>
  );
}
