import { Array2Enum } from "@/process/helper/adapt";
import { eventEmitter } from "@/process/utils";
import React, { ReactNode, useEffect, useState } from "react";

RModal.EModal = Array2Enum(["Test"] as const);

export type NameModal = keyof typeof RModal.EModal | "Dynamic";

export interface IModalOpen {
  name: NameModal;
  status: boolean;
  data?: string;
}

export interface IModalChildren {
  open: IModalOpen;
  onClose: (cb?: () => Promise<void> | void) => void;
}

export interface IModalArgs {
  name: NameModal;
  _set?: {
    overlay?: {
      zIndex: number;
    };
    isFull?: boolean;
    modal?: React.CSSProperties;
  };
  children?: (args: IModalChildren) => ReactNode;
  duration?: number;
  isConfirmClose?: boolean;
  isBottomSheet?: boolean;
}

export function RModal(props: IModalArgs) {
  const { children, name, isBottomSheet, _set } = props;
  const { open, onClose } = RModal.useModal(name);
  const modalData = open?.[name];

  if (!modalData || !modalData.status) return null;

  return (
    <div
      //   className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30"
      style={{ zIndex: _set?.overlay?.zIndex ?? 50 }}
      onClick={() => onClose()}
    >
      <div
        className={`bg-white rounded-lg shadow-xl transition-all ${
          isBottomSheet ? "fixed bottom-0 w-full max-w-screen-md mx-auto" : ""
        }`}
        style={_set?.modal}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Chắc chắn render nội dung nếu có */}
        {typeof children === "function"
          ? children({ open: modalData, onClose })
          : null}
      </div>
    </div>
  );
}

// Hook để quản lý state modal
RModal.useModal = function (name: NameModal) {
  const [open, setOpen] = useState<Record<NameModal, IModalOpen>>({} as any);

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const rawData = localStorage.getItem("libs::modal");
        if (rawData) {
          const storage = JSON.parse(rawData);
          setOpen(storage);
        }
      } catch (e) {
        console.warn("Failed to parse modal storage", e);
      }
    }

    const handler = (data: Record<NameModal, IModalOpen>) => {
      setOpen(data);
    };

    eventEmitter.on(name, handler);

    return () => {
      eventEmitter.off(name, handler);
    };
  }, [name]);

  const onClose = async (cb?: () => Promise<void> | void) => {
    RModal.onShow({ name, status: false });
    if (cb) {
      await cb();
    }
  };

  return { open, onClose };
};

// Hàm để mở/đóng modal và cập nhật localStorage + emit sự kiện
RModal.onShow = async function ({ name, data, status }: IModalOpen) {
  if (typeof window === "undefined") return;

  try {
    const rawData = localStorage.getItem("libs::modal");
    const storage = rawData ? JSON.parse(rawData) : {};

    const updatedValue = {
      ...storage,
      [name]: {
        name,
        status,
        data,
      },
    };

    localStorage.setItem("libs::modal", JSON.stringify(updatedValue));
    eventEmitter.emit(name, updatedValue);
  } catch (e) {
    console.warn("RModal.onShow error", e);
  }
};
