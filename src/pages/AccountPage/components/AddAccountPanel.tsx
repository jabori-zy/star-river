"use client"

import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

// 定义表单项接口
export interface FormFieldConfig {
  name: string
  label: string
  description?: string
  type: "text" | "number" | "password" | "select"
  options?: { label: string; value: string }[]
  placeholder?: string
  required?: boolean
}

// 通用账户表单属性
export interface AccountFormProps {
  title: string
  description: string
  fields: FormFieldConfig[]
  onSubmit?: (values: Record<string, string | number>) => void
  defaultValues?: Record<string, string | number>
  trigger?: React.ReactNode
}

export function AddAccountPanel({
  title,
  description,
  fields,
  onSubmit,
  defaultValues = {},
  trigger,
}: AccountFormProps) {
  // 状态控制对话框的打开和关闭
  const [open, setOpen] = React.useState(false)

  // 基于字段创建zod验证模式
  const formSchema = React.useMemo(() => {
    const schema: Record<string, z.ZodTypeAny> = {}
    
    fields.forEach((field) => {
      let validator
      
      switch (field.type) {
        case "number":
          validator = z.coerce.number({
            required_error: `${field.label}是必填项`,
            invalid_type_error: `${field.label}必须是数字`,
          })
          break
        case "password":
        case "text":
        case "select":
        default:
          validator = z.string({
            required_error: `${field.label}是必填项`,
          })
          break
      }
      
      if (field.required) {
        validator = validator.min(1, { message: `${field.label}是必填项` })
      } else {
        validator = validator.optional()
      }
      
      schema[field.name] = validator
    })
    
    return z.object(schema)
  }, [fields])
  
  // 表单初始化
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues,
  })
  
  // 表单提交处理
  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    if (onSubmit) {
      onSubmit(values)
    } else {
      console.log("表单提交数据:", values)
    }
    
    toast.success(`账户添加成功`, {
      description: `${title}已成功创建`,
    })
    
    setOpen(false)
    form.reset()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || <Button variant="outline">添加账户</Button>}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            {fields.map((field) => (
              <FormField
                key={field.name}
                control={form.control}
                name={field.name}
                render={({ field: formField }) => (
                  <FormItem>
                    <FormLabel>{field.label}</FormLabel>
                    <FormControl>
                      {field.type === "select" ? (
                        <Select
                          onValueChange={formField.onChange}
                          defaultValue={formField.value}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder={field.placeholder} />
                          </SelectTrigger>
                          <SelectContent>
                            {field.options?.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <Input
                          {...formField}
                          type={field.type}
                          placeholder={field.placeholder}
                          className={cn(
                            field.type === "number" && "[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          )}
                        />
                      )}
                    </FormControl>
                    {field.description && (
                      <FormDescription>{field.description}</FormDescription>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />
            ))}
            <DialogFooter className="flex gap-2 sm:gap-0">
              <Button 
                type="button" 
                variant="destructive" 
                onClick={() => setOpen(false)}
              >
                取消
              </Button>
              <Button type="submit">确认添加</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
} 