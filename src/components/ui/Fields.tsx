import type { InputHTMLAttributes, SelectHTMLAttributes } from 'react'
export function Input({ label, id, ...props }: InputHTMLAttributes<HTMLInputElement> & { label: string; id: string }) {
  return <div className="field"><label htmlFor={id}>{label}</label><input id={id} {...props} /></div>
}
export function Select({ label, id, children, ...props }: SelectHTMLAttributes<HTMLSelectElement> & { label: string; id: string }) {
  return <div className="field"><label htmlFor={id}>{label}</label><select id={id} {...props}>{children}</select></div>
}
