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
  ChevronUpDownIcon,
  CogIcon,
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
}: DeviceSelectorProps) {
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

  const getDeviceIcon = () => {
    if (deviceType === "video") {
      return (
        <svg className="size-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      );
    } else {
      return (
        <svg className="size-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
        </svg>
      );
    }
  };

  return (
    <div className="space-y-2">
      <Label className="flex items-center gap-2 text-sm font-medium text-gray-700">
        {getDeviceIcon()}
        <span>{deviceType === "video" ? "Camera" : "Microphone"}</span>
      </Label>
      <div className="relative">
        <Listbox value={selected} onChange={handleChange}>
          <ListboxButton className="relative w-full cursor-default rounded-lg bg-white py-3 pl-4 pr-10 text-left shadow-sm ring-1 ring-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 hover:ring-gray-400 transition-all duration-200">
            <span className="block truncate text-gray-900">
              {selected?.label || "Select a device"}
            </span>
            <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
              <ChevronUpDownIcon
                aria-hidden="true"
                className="size-5 text-gray-400"
              />
            </span>
          </ListboxButton>

          <ListboxOptions
            transition
            className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-lg bg-white py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none data-[closed]:data-[leave]:opacity-0 data-[leave]:transition data-[leave]:duration-100 data-[leave]:ease-in sm:text-sm"
          >
            {list.map((device) => (
              <ListboxOption
                key={device.value}
                value={device}
                className="group relative cursor-default select-none py-3 pl-4 pr-10 text-gray-900 data-[focus]:bg-blue-50 data-[focus]:text-blue-900 hover:bg-gray-50 transition-colors duration-150"
              >
                <span className="block truncate font-normal group-data-[selected]:font-semibold">
                  {device.label}
                </span>

                <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-blue-600 group-[&:not([data-selected])]:hidden">
                  <CheckIcon aria-hidden="true" className="size-5" />
                </span>
              </ListboxOption>
            ))}
          </ListboxOptions>
        </Listbox>
      </div>
    </div>
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
        <DisclosureButton className="group flex w-full items-center justify-between rounded-lg px-4 py-3 text-left text-gray-700 hover:bg-gray-50 transition-colors duration-200">
          <div className="flex items-center gap-2">
            <CogIcon className="size-5 text-gray-500 group-hover:text-gray-600" />
            <span className="text-base font-semibold">Device Settings</span>
            <span className="text-sm text-gray-500">
              ({devices.length} device{devices.length > 1 ? 's' : ''} found)
            </span>
          </div>
          <span className="ml-6 flex h-7 items-center">
            <PlusSmallIcon
              aria-hidden="true"
              className="size-6 group-data-[open]:hidden text-gray-400 group-hover:text-gray-600"
            />
            <MinusSmallIcon
              aria-hidden="true"
              className="size-6 group-[&:not([data-open])]:hidden text-gray-400 group-hover:text-gray-600"
            />
          </span>
        </DisclosureButton>
      </dt>
      <DisclosurePanel className="mt-4 px-4 pb-2">
        <div className="bg-gray-50 rounded-lg p-4">
          {children}
        </div>
      </DisclosurePanel>
    </Disclosure>
  );
};