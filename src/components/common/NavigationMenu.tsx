"use client"

import * as React from "react"
import { Link } from "react-router-dom"
import { CircleHelpIcon } from "lucide-react"

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu"

const components: { title: string; href: string; description: string }[] = [
  {
    title: "GitHub Issues",
    href: "https://github.com/knu-devchat/devchat-frontend/issues",
    description:
      "사용 중 문제가 발생한다면 이슈를 등록해주세요. 빠르게 대응하겠습니다.",
  },
  {
    title: "Mail",
    href: "mailto:jeontaehyun0203@gmail.com",
    description:
      "문의 사항이 있으시면 언제든지 이메일을 보내주세요.",
  },
]

export function NavigationMenuDemo() {
  return (
    <NavigationMenu viewport={false}>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger>프로그램 소개</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid gap-2 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
              <li className="row-span-3">
                <NavigationMenuLink asChild>
                  <a
                    className="from-muted/50 to-muted flex h-full w-full flex-col justify-end rounded-md bg-linear-to-b p-6 no-underline outline-hidden select-none focus:shadow-md"
                    href="/"
                  >
                    <div className="mt-4 mb-2 text-lg font-medium">
                      DevChat
                    </div>
                    <p className="text-muted-foreground text-sm leading-tight">
                      상대방과 함께 사용할 수 있는 AI를 탑재한 협업 메신저.
                    </p>
                  </a>
                </NavigationMenuLink>
              </li>
              <ListItem title="Introduction">
                함께 사용할 수 있는 AI가 탑재되어 있는 협업 메신저.
              </ListItem>
              <ListItem title="why?">
                상대방의 AI가 작성한 코드를 나의 AI에게 다시 입력하는 불편함을 해소합니다.
              </ListItem>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuTrigger>고객센터</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-[400px] gap-2 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
              {components.map((component) => (
                <ListItem
                  key={component.title}
                  title={component.title}
                  href={component.href}
                >
                  {component.description}
                </ListItem>
              ))}
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuContent>
            <ul className="grid w-[200px] gap-4">
              <li>
                <NavigationMenuLink asChild>
                  <Link to="#">Components</Link>
                </NavigationMenuLink>
                <NavigationMenuLink asChild>
                  <Link to="#">Documentation</Link>
                </NavigationMenuLink>
                <NavigationMenuLink asChild>
                  <Link to="#">Blocks</Link>
                </NavigationMenuLink>
              </li>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuTrigger>자주 묻는 질문</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-[200px] gap-4">
              <li>
                <NavigationMenuLink asChild>
                  <Link to="#" className="flex-row items-center gap-2">
                    <CircleHelpIcon />
                    자주 묻는 질문 1
                  </Link>
                </NavigationMenuLink>
                <NavigationMenuLink asChild>
                  <Link to="#" className="flex-row items-center gap-2">
                    <CircleHelpIcon />
                    자주 묻는 질문 2
                  </Link>
                </NavigationMenuLink>
                <NavigationMenuLink asChild>
                  <Link to="#" className="flex-row items-center gap-2">
                    <CircleHelpIcon />
                    자주 묻는 질문 3
                  </Link>
                </NavigationMenuLink>
              </li>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  )
}

function ListItem({
  title,
  children,
  href,
  ...props
}: React.ComponentPropsWithoutRef<"li"> & { href?: string }) {
  const content = (
    <div className="text-sm font-medium leading-none">{title}</div>
  )

  const description = (
    <p className="text-muted-foreground line-clamp-2 text-sm leading-snug">
      {children}
    </p>
  )

  return (
    <li {...props}>
      <NavigationMenuLink asChild>
        {href ? (
          <Link
            to={href}
            className="block rounded-md p-3 transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            {content}
            {description}
          </Link>
        ) : (
          <div
            className="block rounded-md p-3 transition-colors hover:bg-accent hover:text-accent-foreground cursor-default"
            role="button"
            tabIndex={0}
          >
            {content}
            {description}
          </div>
        )}
      </NavigationMenuLink>
    </li>
  )
}
