'use client'

import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Form, FormField, FormItem, FormControl, FormDescription, FormLabel } from "@/components/ui/form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { Slider } from "@/components/ui/slider"
import { useSoundStore } from "@/components/audio/notification-sounds"

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

  const { volume, muted, setVolume, toggleMute } = useSoundStore()

  function onSubmit(data: NotificationFormValues) {
    console.log(data)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div>
          <h3 className="mb-4 text-lg font-medium">Email Notifications</h3>
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="emailNotifications"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel>Email Notifications</FormLabel>
                    <FormDescription>
                      Receive email notifications when there are updates to your tickets.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
        </div>
        <Separator />
        <div>
          <h3 className="mb-4 text-lg font-medium">Push Notifications</h3>
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="pushNotifications"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel>Browser Notifications</FormLabel>
                    <FormDescription>
                      Receive browser notifications when there are updates to your tickets.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
        </div>
        <Separator />
        <div>
          <h3 className="mb-4 text-lg font-medium">Sound Settings</h3>
          <div className="space-y-4">
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
              <div className="space-y-0.5">
                <FormLabel>Notification Sounds</FormLabel>
                <FormDescription>
                  Play sounds for notifications and updates.
                </FormDescription>
              </div>
              <FormControl>
                <Checkbox
                  checked={!muted}
                  onCheckedChange={toggleMute}
                />
              </FormControl>
            </FormItem>
            {!muted && (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                <div className="space-y-0.5">
                  <FormLabel>Sound Volume</FormLabel>
                  <FormDescription>
                    Adjust the volume of notification sounds.
                  </FormDescription>
                </div>
                <FormControl>
                  <Slider
                    className="w-[120px]"
                    value={[volume]}
                    min={0}
                    max={1}
                    step={0.1}
                    onValueChange={([value]) => setVolume(value)}
                  />
                </FormControl>
              </FormItem>
            )}
          </div>
        </div>
        <Button type="submit">Save changes</Button>
      </form>
    </Form>
  )
} 