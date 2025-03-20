"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";
import { Ticket, Wrench, MessageCircle} from "lucide-react";
import {Navbar} from "@/components/navbar";
import { Sidebar } from "@/components/sidebar";
import { useState } from "react";
import { useMobile } from "@/hooks/useMobile";
export default function HomePage() {
  const { data: session } = useSession();
  const url = session ? "/dashboard" : "/login";
  const { isMobileOpen, setIsMobileOpen } = useMobile();
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);

  const handleSidebarToggle = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };


  const features = [
    {
      icon: <Ticket className="h-8 w-8" />,
      title: "Simple & Intuitive",
      description: "Easy-to-use interface designed for efficient ticket management.",
    },
    {
      icon: <Wrench className="h-8 w-8" />,
      title: "Blockchain Powered",
      description: "Immutable ticket history with transparent tracking.",
    },
    {
      icon: <MessageCircle className="h-8 w-8" />,
      title: "Team Collaboration",
      description: "Work together seamlessly with built-in commenting and updates.",
    },
  ];

  return (
    <div className="flex min-h-screen flex-col">
      {/* Sidebar */}
      {isSidebarOpen && (
        <div
          onClick={handleSidebarToggle}
          className="fixed inset-0 bg-black/70 z-40"
        ></div>
      )}
      <div className={`fixed top-0 left-0 h-screen w-64 transition-transform duration-300 ease-in-out z-50 ${
           isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}>
        <Sidebar mobileOpen={isMobileOpen} onMobileOpenChange={setIsMobileOpen} />
      </div>
      {/* Navbar */}
      <Navbar onMobileMenuClick={handleSidebarToggle} />

      {/* Main Content */}
      <div className="flex flex-1 flex-col items-center justify-center px-4 pt-20"> {/* Adjusted padding-top for navbar */}
        <div className="mx-auto max-w-7xl space-y-12 text-center">
          {/* Hero Section */}
          <div className="space-y-8">
            <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
              Modern Ticket Management
            </h1>
            <p className="mx-auto max-w-2xl text-xl text-muted-foreground">
              Streamline your support workflow with our intuitive ticket management system.
              Track issues, collaborate with your team, and resolve tickets efficiently
              with blockchain-powered tracking.
            </p>
            <div className="space-y-4">
              <Button
                size="lg"
                className="h-12 px-8 text-lg"
                asChild
              >
                <Link href={url}>
                  {session ? "Access Dashboard" : "Get Started"}
                </Link>
              </Button>
              <p className="text-sm text-muted-foreground">
                {session ? "Continue to dashboard" : "No account required to try"}
              </p>
            </div>
          </div>

          {/* Visual Element (Generic ticketing system image) */}
          <div className="relative mx-auto max-w-6xl">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-xl blur-3xl" />
            <div className="relative rounded-xl border bg-card p-8 shadow-lg">
              <img
                src="https://images.unsplash.com/photo-1556745757-8d76bdb6984b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80"
                alt="Ticket Management System"
                className="rounded-lg w-full h-auto"
              />
            </div>
          </div>

          {/* Features Section */}
          <div className="mx-auto max-w-7xl space-y-12">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
              {features.map((feature, index) => (
                <div key={index} className="space-y-4 rounded-lg border bg-card p-6 text-center shadow-sm">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    {feature.icon}
                  </div>
                  <h2 className="text-xl font-semibold">{feature.title}</h2>
                  <p className="text-muted-foreground">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* CTA Section */}
          <div className="mx-auto max-w-4xl space-y-8 text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Ready to streamline your support workflow?
            </h2>
            <p className="mx-auto max-w-2xl text-xl text-muted-foreground">
              Join thousands of teams using our ticket management system to deliver exceptional support.
            </p>
            <Button
              size="lg"
              className="h-12 px-8 text-lg"
              asChild
            >
              <Link href={url}>
                {session ? "Access Dashboard" : "Get Started"}
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t bg-card mt-16">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {/* Company Info */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Ticket className="h-6 w-6 dark:text-white text-black" />
                <span className="font-mono text-xl tracking-tight dark:text-white text-black">
                  TixHub
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                Streamline your support workflow with our intuitive ticket management system.
              </p>
            </div>

            {/* Quick Links */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold">Quick Links</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-primary">
                    Dashboard
                  </Link>
                </li>
                <li>
                  <Link href="/tickets" className="text-sm text-muted-foreground hover:text-primary">
                    Tickets
                  </Link>
                </li>
                <li>
                  <Link href="/settings" className="text-sm text-muted-foreground hover:text-primary">
                    Settings
                  </Link>
                </li>
              </ul>
            </div>

            {/* Resources */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold">Resources</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/docs" className="text-sm text-muted-foreground hover:text-primary">
                    Documentation
                  </Link>
                </li>
                <li>
                  <Link href="/support" className="text-sm text-muted-foreground hover:text-primary">
                    Support
                  </Link>
                </li>
                <li>
                  <Link href="/blog" className="text-sm text-muted-foreground hover:text-primary">
                    Blog
                  </Link>
                </li>
              </ul>
            </div>

            {/* Contact */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold">Contact</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/contact" className="text-sm text-muted-foreground hover:text-primary">
                    Contact Us
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="text-sm text-muted-foreground hover:text-primary">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="text-sm text-muted-foreground hover:text-primary">
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Copyright */}
          <div className="mt-8 border-t pt-8 text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} TixHub. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}