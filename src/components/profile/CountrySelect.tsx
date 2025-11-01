import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const countries = [
  "United States", "Canada", "United Kingdom", "Australia", "Germany", "France",
  "Italy", "Spain", "Netherlands", "Belgium", "Switzerland", "Austria",
  "Sweden", "Norway", "Denmark", "Finland", "Poland", "Czech Republic",
  "Portugal", "Ireland", "Greece", "Japan", "South Korea", "China",
  "India", "Singapore", "Malaysia", "Thailand", "Indonesia", "Philippines",
  "Vietnam", "Brazil", "Mexico", "Argentina", "Chile", "Colombia",
  "South Africa", "Egypt", "Nigeria", "Kenya", "United Arab Emirates", "Saudi Arabia",
  "Israel", "Turkey", "Russia", "Ukraine", "New Zealand", "Other"
].sort();

interface CountrySelectProps {
  value?: string;
  onChange: (value: string) => void;
}

export function CountrySelect({ value, onChange }: CountrySelectProps) {
  return (
    <Select value={value || ""} onValueChange={onChange}>
      <SelectTrigger>
        <SelectValue placeholder="Select country" />
      </SelectTrigger>
      <SelectContent>
        {countries.map((country) => (
          <SelectItem key={country} value={country}>
            {country}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
