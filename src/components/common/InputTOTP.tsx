"use client"

import * as React from "react"

import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp"

interface InputOTPControlledProps {
  value?: string
  onChange?: (value: string) => void
}

export function InputOTPControlled({ value = "", onChange }: InputOTPControlledProps) {
  const [internalValue, setInternalValue] = React.useState("")
  const currentValue = value !== undefined ? value : internalValue
  
  const handleChange = (newValue: string) => {
    if (onChange) {
      onChange(newValue)
    } else {
      setInternalValue(newValue)
    }
  }

  return (
    <div className="space-y-2">
      <InputOTP
        maxLength={6}
        value={currentValue}
        onChange={handleChange}
      >
        <InputOTPGroup>
          <InputOTPSlot index={0} />
          <InputOTPSlot index={1} />
          <InputOTPSlot index={2} />
          <InputOTPSlot index={3} />
          <InputOTPSlot index={4} />
          <InputOTPSlot index={5} />
        </InputOTPGroup>
      </InputOTP>
      <div className="text-center text-sm">
        {currentValue === "" ? (
          <>OTP를 입력하세요.</>
        ) : (
          <>입력된 OTP: {currentValue}</>
        )}
      </div>
    </div>
  )
}
