import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const industries = [
  "Technology & Software",
  "Marketing & Advertising",
  "Finance & Banking",
  "Healthcare & Medical",
  "Education",
  "Retail & E-commerce",
  "Manufacturing",
  "Media & Entertainment",
  "Real Estate",
  "Consulting",
  "Hospitality & Tourism",
  "Construction",
  "Transportation & Logistics",
  "Energy & Utilities",
  "Legal Services",
  "Government & Public Sector",
  "Non-Profit",
  "Agriculture",
  "Telecommunications",
  "Other"
];

interface IndustrySelectProps {
  value?: string;
  onChange: (value: string) => void;
}

export function IndustrySelect({ value, onChange }: IndustrySelectProps) {
  return (
    <Select value={value || ""} onValueChange={onChange}>
      <SelectTrigger>
        <SelectValue placeholder="Select industry" />
      </SelectTrigger>
      <SelectContent>
        {industries.map((industry) => (
          <SelectItem key={industry} value={industry}>
            {industry}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
