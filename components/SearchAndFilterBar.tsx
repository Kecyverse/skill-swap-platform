// File: components/SearchAndFilterBar.tsx
"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { FormEvent } from "react";

export default function SearchAndFilterBar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function handleFilter(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const query = formData.get("query") as string;
    const availability = formData.get("availability") as string;
    
    const params = new URLSearchParams(searchParams);
    
    if (query) {
      params.set("query", query);
    } else {
      params.delete("query");
    }

    if (availability && availability !== "any") {
      params.set("availability", availability);
    } else {
      params.delete("availability");
    }
    
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="bg-slate-100 dark:bg-slate-900 py-10">
      <form onSubmit={handleFilter} className="container mx-auto">
        <h1 className="text-center text-4xl font-bold tracking-tight mb-2">
          Find Your Next Skill Swap
        </h1>
        <p className="text-center text-lg text-muted-foreground mb-6">
          Search for a skill or browse available users.
        </p>
        <div className="flex flex-col md:flex-row gap-4 max-w-2xl mx-auto">
          <Input
            type="search"
            name="query"
            defaultValue={searchParams.get("query") || ""}
            placeholder="Search for a skill like 'Photoshop'..."
            className="flex-grow"
          />
          <Select name="availability" defaultValue={searchParams.get("availability") || "any"}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Filter by Availability" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="any">Any Availability</SelectItem>
              <SelectItem value="weekends">Weekends</SelectItem>
              <SelectItem value="evenings">Evenings</SelectItem>
              <SelectItem value="weekdays">Weekdays</SelectItem>
            </SelectContent>
          </Select>
          <Button type="submit" className="w-full md:w-auto">Search</Button>
        </div>
      </form>
    </div>
  );
}