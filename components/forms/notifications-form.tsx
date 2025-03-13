'use client'

import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Form, FormField, FormItem, FormControl } from "@/components/ui/form"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"

const formSchema = z.object({
  emailNotifications: z.boolean().default(true),
  pushNotifications: z.boolean().default(true),
  ticketUpdates: z.boolean().default(true),
  messageNotifications: z.boolean().default(true),
})

type NotificationFormValues = z.infer<typeof formSchema>

export function NotificationsForm() {
  const form = useForm<NotificationFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      emailNotifications: true,
      pushNotifications: true,
      ticketUpdates: true,
      messageNotifications: true,
    },
  })

  function onSubmit(data: NotificationFormValues) {
    console.log(data)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="emailNotifications"
            render={({ field }) => (
              <FormItem className="flex items-center justify-between space-x-4">
                <div className="space-y-0.5">
                  <Label htmlFor="email-notifications">Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive email notifications for important updates.
                  </p>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    id="email-notifications"
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="pushNotifications"
            render={({ field }) => (
              <FormItem className="flex items-center justify-between space-x-4">
                <div className="space-y-0.5">
                  <Label htmlFor="push-notifications">Push Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive push notifications in your browser.
                  </p>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    id="push-notifications"
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="ticketUpdates"
            render={({ field }) => (
              <FormItem className="flex items-center justify-between space-x-4">
                <div className="space-y-0.5">
                  <Label htmlFor="ticket-updates">Ticket Updates</Label>
                  <p className="text-sm text-muted-foreground">
                    Get notified when your tickets are updated.
                  </p>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    id="ticket-updates"
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="messageNotifications"
            render={({ field }) => (
              <FormItem className="flex items-center justify-between space-x-4">
                <div className="space-y-0.5">
                  <Label htmlFor="message-notifications">Message Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive notifications for new messages.
                  </p>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    id="message-notifications"
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>
        <Button type="submit" className="w-fit">Save preferences</Button>
      </form>
    </Form>
  )
} 