import {
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
  Label,
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
} from "@headlessui/react";
import {
  CheckIcon,
  // ChevronDownIcon,
  ChevronUpDownIcon,
} from "@heroicons/react/16/solid";
import { PlusSmallIcon } from "@heroicons/react/24/outline";
import { MinusSmallIcon } from "@heroicons/react/24/outline";
import { useMemo, useState } from "react";

interface DeviceSelectorProps {
  deviceType: "video" | "audio";
  devices: MediaDeviceInfo[];
  selectedDeviceId?: { value: string; label: string };
  onChange?: (deviceId: string) => void;
}

export function DeviceSelector({
  deviceType,
  devices,
  onChange,
}: // selectedDeviceId,
// onChange,
DeviceSelectorProps) {
  const list = useMemo(
    () =>
      devices.map((device, index) => ({
        value: device.deviceId,
        label: device.label || `Device ${index + 1}`,
      })),
    [devices]
  );

  const [selected, setSelected] = useState<{ value: string; label: string }>(
    list[0] ?? undefined
  );

  if (devices.length === 0) return null;

  const handleChange = (value: { value: string; label: string }) => {
    const device = devices.find((d) => d.deviceId === value.value);
    if (device) {
      setSelected(value);
      onChange?.(device.deviceId);
    }
  };

  return (
    <Listbox value={selected} onChange={handleChange}>
      <Label className="block text-sm/6 font-medium text-gray-900">
        {deviceType === "video" ? "Video" : "Audio"} Device
      </Label>
      <div className="relative mt-2">
        <ListboxButton className="grid w-full cursor-default grid-cols-1 rounded-md bg-white py-1.5 pl-3 pr-2 text-left text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6">
          <span className="col-start-1 row-start-1 truncate pr-6">
            {selected?.label || "Select a device"}
          </span>
          <ChevronUpDownIcon
            aria-hidden="true"
            className="col-start-1 row-start-1 size-5 self-center justify-self-end text-gray-500 sm:size-4"
          />
        </ListboxButton>

        <ListboxOptions
          transition
          className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none data-[closed]:data-[leave]:opacity-0 data-[leave]:transition data-[leave]:duration-100 data-[leave]:ease-in sm:text-sm"
        >
          {list.map((device) => (
            <ListboxOption
              key={device.value}
              value={device}
              className="group relative cursor-default select-none py-2 pl-3 pr-9 text-gray-900 data-[focus]:bg-indigo-600 data-[focus]:text-white data-[focus]:outline-none"
            >
              <span className="block truncate font-normal group-data-[selected]:font-semibold">
                {device.label}
              </span>

              <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-indigo-600 group-[&:not([data-selected])]:hidden group-data-[focus]:text-white">
                <CheckIcon aria-hidden="true" className="size-5" />
              </span>
            </ListboxOption>
          ))}
        </ListboxOptions>
      </div>
    </Listbox>
  );
}

export const OptionsDisclosure = ({
  children,
  devices,
}: {
  children: React.ReactNode;
  devices: MediaDeviceInfo[];
}) => {
  if (devices.length === 0) return null;

  return (
    <Disclosure>
      <dt>
        <DisclosureButton className="group flex w-full items-start justify-between text-left text-gray-900">
          <span className="text-base/7 font-semibold">Options</span>
          <span className="ml-6 flex h-7 items-center">
            <PlusSmallIcon
              aria-hidden="true"
              className="size-6 group-data-[open]:hidden"
            />
            <MinusSmallIcon
              aria-hidden="true"
              className="size-6 group-[&:not([data-open])]:hidden"
            />
          </span>
        </DisclosureButton>
      </dt>
      <DisclosurePanel className="mt-2 pr-12">{children}</DisclosurePanel>
    </Disclosure>
  );
};
