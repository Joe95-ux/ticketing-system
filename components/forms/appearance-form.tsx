'use client'

import { Button } from "@/components/ui/button"
import { useTheme } from "next-themes"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export function AppearanceForm() {
  const { theme, setTheme } = useTheme()

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="theme">Theme</Label>
          <p className="text-sm text-muted-foreground">
            Select your preferred theme for the application.
          </p>
          <Select
            value={theme}
            onValueChange={(value) => setTheme(value)}
          >
            <SelectTrigger id="theme">
              <SelectValue placeholder="Select theme" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="light">Light</SelectItem>
              <SelectItem value="dark">Dark</SelectItem>
              <SelectItem value="system">System</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="fontSize">Font Size</Label>
          <p className="text-sm text-muted-foreground">
            Choose your preferred font size.
          </p>
          <Select defaultValue="medium">
            <SelectTrigger id="fontSize">
              <SelectValue placeholder="Select size" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="small">Small</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="large">Large</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <Button type="submit" className="w-fit">Save preferences</Button>
    </div>
  )
} 