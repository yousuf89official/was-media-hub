import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const timezones = [
  { value: "America/New_York", label: "Eastern Time (ET) - UTC-5" },
  { value: "America/Chicago", label: "Central Time (CT) - UTC-6" },
  { value: "America/Denver", label: "Mountain Time (MT) - UTC-7" },
  { value: "America/Los_Angeles", label: "Pacific Time (PT) - UTC-8" },
  { value: "America/Anchorage", label: "Alaska Time - UTC-9" },
  { value: "Pacific/Honolulu", label: "Hawaii Time - UTC-10" },
  { value: "Europe/London", label: "London (GMT) - UTC+0" },
  { value: "Europe/Paris", label: "Paris (CET) - UTC+1" },
  { value: "Europe/Athens", label: "Athens (EET) - UTC+2" },
  { value: "Europe/Moscow", label: "Moscow - UTC+3" },
  { value: "Asia/Dubai", label: "Dubai - UTC+4" },
  { value: "Asia/Karachi", label: "Karachi - UTC+5" },
  { value: "Asia/Dhaka", label: "Dhaka - UTC+6" },
  { value: "Asia/Bangkok", label: "Bangkok - UTC+7" },
  { value: "Asia/Singapore", label: "Singapore - UTC+8" },
  { value: "Asia/Tokyo", label: "Tokyo - UTC+9" },
  { value: "Australia/Sydney", label: "Sydney - UTC+10" },
  { value: "Pacific/Auckland", label: "Auckland - UTC+12" },
];

interface TimezoneSelectProps {
  value?: string;
  onChange: (value: string) => void;
}

export function TimezoneSelect({ value, onChange }: TimezoneSelectProps) {
  return (
    <Select value={value || ""} onValueChange={onChange}>
      <SelectTrigger>
        <SelectValue placeholder="Select timezone" />
      </SelectTrigger>
      <SelectContent>
        {timezones.map((tz) => (
          <SelectItem key={tz.value} value={tz.value}>
            {tz.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
