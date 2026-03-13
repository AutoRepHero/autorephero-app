import { useEffect } from "react";
import { useLocation } from "wouter";

export default function Home() {
  const [, navigate] = useLocation();
  useEffect(() => {
    navigate("/landing", { replace: true });
  }, [navigate]);
  return null;
}
