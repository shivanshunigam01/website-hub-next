"use client";

import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { EducationEntry, ExperienceEntry } from "@/lib/auth-types";
import { emptyEducationEntry, emptyExperienceEntry } from "@/lib/teacher-profile-utils";

type EntrySectionProps<T extends EducationEntry | ExperienceEntry> = {
  title: string;
  entries: T[];
  onChange: (entries: T[]) => void;
  renderFields: (
    entry: T,
    index: number,
    update: (patch: Partial<T>) => void,
  ) => React.ReactNode;
  createEmpty: () => T;
  validate: (entry: T) => string | null;
};

function EntrySection<T extends EducationEntry | ExperienceEntry>({
  title,
  entries,
  onChange,
  renderFields,
  createEmpty,
  validate,
}: EntrySectionProps<T>) {
  const add = () => onChange([...entries, createEmpty()]);
  const remove = (index: number) => onChange(entries.filter((_, i) => i !== index));
  const updateAt = (index: number, patch: Partial<T>) => {
    onChange(entries.map((entry, i) => (i === index ? { ...entry, ...patch } : entry)));
  };

  return (
    <div className="space-y-4 rounded-xl border bg-muted/20 p-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold">{title}</h2>
        <Button type="button" variant="outline" size="sm" onClick={add}>
          <Plus className="mr-1 h-4 w-4" />
          Add
        </Button>
      </div>
      {entries.length === 0 && (
        <p className="text-sm text-muted-foreground">Add at least one entry to complete your profile.</p>
      )}
      {entries.map((entry, index) => {
        const error = validate(entry);
        return (
          <div key={entry.id || index} className="space-y-3 rounded-xl border bg-background p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Entry {index + 1}
              </span>
              <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => remove(index)}>
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
            {renderFields(entry, index, (patch) => updateAt(index, patch))}
            {error && <p className="text-xs text-destructive">{error}</p>}
          </div>
        );
      })}
    </div>
  );
}

export function EducationFormSection({
  entries,
  onChange,
}: {
  entries: EducationEntry[];
  onChange: (entries: EducationEntry[]) => void;
}) {
  return (
    <EntrySection
      title="Education"
      entries={entries}
      onChange={onChange}
      createEmpty={emptyEducationEntry}
      validate={(entry) => {
        if (!entry.degree.trim() || !entry.institute.trim()) return "Degree and institute are required";
        return null;
      }}
      renderFields={(entry, _index, update) => (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Degree</Label>
              <Input
                className="mt-1"
                value={entry.degree}
                onChange={(e) => update({ degree: e.target.value })}
                placeholder="B.Sc Mathematics"
                required
              />
            </div>
            <div>
              <Label>Institute</Label>
              <Input
                className="mt-1"
                value={entry.institute}
                onChange={(e) => update({ institute: e.target.value })}
                placeholder="University name"
                required
              />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Start date</Label>
              <Input
                type="date"
                className="mt-1"
                value={entry.startDate || ""}
                onChange={(e) => update({ startDate: e.target.value })}
              />
            </div>
            <div>
              <Label>End date</Label>
              <Input
                type="date"
                className="mt-1"
                value={entry.endDate || ""}
                onChange={(e) => update({ endDate: e.target.value })}
              />
            </div>
          </div>
          <div>
            <Label>Description (optional)</Label>
            <Textarea
              className="mt-1"
              value={entry.description || ""}
              onChange={(e) => update({ description: e.target.value })}
              rows={2}
            />
          </div>
        </>
      )}
    />
  );
}

export function ExperienceFormSection({
  entries,
  onChange,
}: {
  entries: ExperienceEntry[];
  onChange: (entries: ExperienceEntry[]) => void;
}) {
  return (
    <EntrySection
      title="Experience"
      entries={entries}
      onChange={onChange}
      createEmpty={emptyExperienceEntry}
      validate={(entry) => {
        if (!entry.title.trim() || !entry.organization.trim()) {
          return "Title and organization are required";
        }
        return null;
      }}
      renderFields={(entry, _index, update) => (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Title</Label>
              <Input
                className="mt-1"
                value={entry.title}
                onChange={(e) => update({ title: e.target.value })}
                placeholder="Senior Maths Tutor"
                required
              />
            </div>
            <div>
              <Label>Organization</Label>
              <Input
                className="mt-1"
                value={entry.organization}
                onChange={(e) => update({ organization: e.target.value })}
                placeholder="School / Institute"
                required
              />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Start date</Label>
              <Input
                type="date"
                className="mt-1"
                value={entry.startDate || ""}
                onChange={(e) => update({ startDate: e.target.value })}
              />
            </div>
            <div>
              <Label>End date</Label>
              <Input
                type="date"
                className="mt-1"
                value={entry.endDate || ""}
                onChange={(e) => update({ endDate: e.target.value })}
              />
            </div>
          </div>
          <div>
            <Label>Description (optional)</Label>
            <Textarea
              className="mt-1"
              value={entry.description || ""}
              onChange={(e) => update({ description: e.target.value })}
              rows={2}
            />
          </div>
        </>
      )}
    />
  );
}
