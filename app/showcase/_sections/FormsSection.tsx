"use client";

import { useState } from "react";
import { isEmail } from "@/app/shared/forms/validation";
import { Calendar } from "@/app/shared/ui/Calendar";
import { Checkbox } from "@/app/shared/ui/Checkbox";
import { Combobox } from "@/app/shared/ui/Combobox";
import { DatePicker } from "@/app/shared/ui/DatePicker";
import { Field } from "@/app/shared/ui/Field";
import { InputGroup } from "@/app/shared/ui/InputGroup";
import { PasswordInput } from "@/app/shared/ui/PasswordInput";
import { TextArea } from "@/app/shared/ui/TextArea";
import { TextInput } from "@/app/shared/ui/TextInput";
import { Demo, ShowcaseGroup } from "../_components/Demo";
import { BREEDS, SAMPLE_DATE } from "../_data/showcase-data";

const EARLIEST_BOOKABLE = new Date(2026, 9, 1);

/** 01, 03, 08, 09, 11, 14, 18: inputs and selection controls. */
export default function FormsSection() {
  const [email, setEmail] = useState("emma@");
  const [breed, setBreed] = useState<string | null>("labrador");
  const [date, setDate] = useState<Date | null>(SAMPLE_DATE);
  const emailValid = isEmail(email);

  return (
    <ShowcaseGroup
      title="Forms"
      description="Inputs, selection and validation."
    >
      <Demo
        index="01"
        title="Input Fields"
        subtitle="State examples for text inputs."
      >
        <Field label="Email address · Normal">
          <TextInput type="email" defaultValue="emma@vertivet.com" />
        </Field>
        <Field label="Email address · Focus">
          <TextInput
            type="email"
            defaultValue="emma@vertivet.com"
            data-focused=""
          />
        </Field>
        <Field
          label="Email address · Live validation"
          error={emailValid ? undefined : "Enter a valid email address."}
          success={emailValid ? "Email address is valid." : undefined}
        >
          <TextInput
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </Field>
        <Field label="Email address · Disabled" disabled>
          <TextInput type="email" defaultValue="emma@vertivet.com" />
        </Field>
      </Demo>

      <Demo index="03" title="Input Group" subtitle="Grouped form controls.">
        <Field
          label="Clinic email"
          hint="Shared border, attached prefix and input."
        >
          <InputGroup startAddon="@">
            <TextInput placeholder="care@vertivet.com" />
          </InputGroup>
        </Field>
        <Field label="Weight">
          <InputGroup endAddon="kg">
            <TextInput type="number" defaultValue="24.5" />
          </InputGroup>
        </Field>
        <Field label="Password" labelVariant="caps">
          <PasswordInput defaultValue="vertivet-demo" />
        </Field>
      </Demo>

      <Demo index="08" title="Checkbox" subtitle="Selection controls.">
        <Checkbox label="Send appointment reminders" />
        <Checkbox label="Send appointment reminders" defaultChecked />
        <Checkbox label="Send appointment reminders" disabled />
        <Checkbox label="Some pets selected" indeterminate />
      </Demo>

      <Demo index="09" title="Combobox" subtitle="Dropdown selection.">
        <Field label="Breed">
          <Combobox
            options={BREEDS}
            value={breed}
            onValueChange={setBreed}
            placeholder="Select a breed"
            searchPlaceholder="Search breeds…"
          />
        </Field>
      </Demo>

      <Demo index="11" title="Date Picker" subtitle="Calendar selection.">
        <Calendar value={date} onChange={setDate} />
        <Field label="Preferred appointment date">
          <DatePicker value={date} onChange={setDate} min={EARLIEST_BOOKABLE} />
        </Field>
      </Demo>

      <Demo index="14" title="Field" subtitle="Basic text field.">
        <Field
          label="Pet's name"
          required
          hint="Use the name on your pet's health record."
        >
          <TextInput defaultValue="Luna" />
        </Field>
      </Demo>

      <Demo index="18" title="Text Area" subtitle="Multi-line input.">
        <Field
          label="Clinical notes"
          hint="Record symptoms and relevant observations."
        >
          <TextArea
            defaultValue={
              "Patient is experiencing mild coughing.\nAppetite and activity levels are normal."
            }
          />
        </Field>
      </Demo>
    </ShowcaseGroup>
  );
}
