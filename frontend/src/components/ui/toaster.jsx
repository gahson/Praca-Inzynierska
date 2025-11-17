import React from "react";
import { toast } from 'react-hot-toast'

export const toaster = {
  create: ({ title, description, status = 'info', duration = 3000 }) => {
    toast.custom(
      (t) => (
        <div
          className={`flex items-start gap-2 rounded-md shadow-md p-3 max-w-sm
          ${status === 'error' ? 'bg-red-100 text-red-800' : ''}
          ${status === 'success' ? 'bg-green-100 text-green-800' : ''}
          ${status === 'warning' ? 'bg-yellow-100 text-yellow-800' : ''}
          ${status === 'info' ? 'bg-blue-100 text-blue-800' : ''}`}
        >
          <div className="flex flex-col">
            {title && <span className="font-semibold text-sm">{title}</span>}
            {description && <span className="text-xs">{description}</span>}
          </div>
        </div>
      ),
      { duration }
    )
  },
}
