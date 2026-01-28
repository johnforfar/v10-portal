"use client"

import React from "react"
import Image from "next/image"
import NextLink from "next/link"
import { usePathname } from "next/navigation"
import { OpenxAIContract } from "@/contracts/OpenxAI"
import {
  faCircleCheck,
  faClipboardList,
  faCoins,
  faDollarSign,
  faFlagCheckered,
  faMoneyCheckDollar,
  faRocket,
  faScaleBalanced,
  faChartLine,
} from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { useWeb3Modal } from "@web3modal/wagmi/react"
import { Address, formatUnits } from "viem"
import { useAccount, useReadContract } from "wagmi"

import { cn } from "@/lib/utils"

export interface SideMenuProps extends React.HTMLAttributes<HTMLDivElement> {}

const SIDE_MENU_ITEMS = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: <FontAwesomeIcon icon={faCircleCheck} className="size-4" />,
  },
  {
    name: "Ecosystem",
    href: "/ecosystem",
    icon: <FontAwesomeIcon icon={faChartLine} className="size-4" />,
  },
  // {
  //   name: "Genesis",
  //   href: "/genesis",
  //   icon: <FontAwesomeIcon icon={faRocket} className="size-4" />,
  // },
  {
    name: "Token",
    href: "/token",
    icon: <FontAwesomeIcon icon={faMoneyCheckDollar} className="size-4" />,
  },
  {
    name: "Claims",
    href: "/claims",
    icon: <FontAwesomeIcon icon={faFlagCheckered} className="size-4" />,
  },
  // {
  //   name: "Stake",
  //   href: "/stake",
  //   icon: <FontAwesomeIcon icon={faCoins} className="size-4" />,
  // },
  {
    name: "Earn",
    href: "/earn",
    icon: <FontAwesomeIcon icon={faDollarSign} className="size-4" />,
  },
  {
    name: "Governance",
    href: "/governance",
    icon: <FontAwesomeIcon icon={faScaleBalanced} className="size-4" />,
  },
  {
    name: "Roadmap",
    href: "https://changelog.openxai.org/planned",
    icon: <FontAwesomeIcon icon={faClipboardList} className="size-4" />,
  },
]

const SOCIAL_ITEMS = [
  {
    name: "X",
    href: "https://x.com/OpenxAINetwork",
    icon: (
      <svg
        className="size-5 text-white hover:opacity-80"
        fill="currentColor"
        viewBox="0 0 24 24"
      >
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  {
    name: "Telegram",
    href: "https://t.me/OpenxAINetwork",
    icon: (
      <svg
        className="size-5 text-white hover:opacity-80"
        fill="currentColor"
        viewBox="0 0 24 24"
      >
        <path d="M21.93 3.24l-3.35 17.52A1.51 1.51 0 0117.12 22a1.53 1.53 0 01-1.09-.45l-6.9-6.89-3.35 3.35a.49.49 0 01-.35.15.5.5 0 01-.5-.5v-4.29l12.45-12.46a.5.5 0 01-.7.71L4.55 13.75l-2.85-1a1.51 1.51 0 01.1-2.89l18.59-7.15a1.51 1.51 0 011.54 2.53z" />
      </svg>
    ),
  },
]

export function SideMenu({ className, ...props }: SideMenuProps) {
  const pathname = usePathname()
  const { open } = useWeb3Modal()
  const { address } = useAccount()

  const { data: openxBalance } = useReadContract({
    abi: OpenxAIContract.abi,
    address: OpenxAIContract.address,
    functionName: "balanceOf",
    args: [address as Address],
    query: {
      enabled: !!address,
    },
  })

  const openxBalanceNum =
    openxBalance !== undefined
      ? parseFloat(formatUnits(openxBalance, 18))
      : undefined
  const openxBalancePretty =
    openxBalanceNum !== undefined
      ? openxBalanceNum > 1_000_000
        ? `${(openxBalanceNum / 1_000_000).toPrecision(3)}M`
        : openxBalanceNum > 1_000
          ? `${(openxBalanceNum / 1_000).toPrecision(3)}K`
          : openxBalanceNum > 1
            ? `${openxBalanceNum.toPrecision(3)}`
            : openxBalanceNum > 0.01
              ? `${openxBalanceNum.toFixed(2)}`
              : openxBalanceNum > 0
                ? "~0"
                : "0"
      : undefined

  return (
    <>
      {/* Desktop Side Menu - shown only when viewport is at least 960px */}
      <div
        className={cn(
          "fixed left-0 top-0 hidden h-full w-[234px] p-4 [background:radial-gradient(at_center,_#4C4C4C_0%,_#1C1C1C_100%)_0_0/100vw_100vh] [@media(min-width:960px)]:block",
          className
        )}
        {...props}
      >
        {/* OpenxAI Logo */}
        <div className="mb-6 mt-4 flex justify-center">
          <NextLink
            href="https://openxai.org"
            className="w-full hover:opacity-80"
          >
            <Image
              src="/logo/openxai-logo-white-transparent.png"
              alt="OpenxAI"
              width={0}
              height={0}
              sizes="100%"
              className="h-auto w-full"
              priority
            />
          </NextLink>
        </div>

        {/* Wallet Connect Card */}
        <div className="relative mb-10 h-[107px] w-full rounded-lg">
          {/* Content */}
          <div className="relative flex h-full flex-col justify-end rounded-lg bg-[#1F2021] p-4">
            {!address ? (
              <>
                {/* Disconnected State */}
                <div className="relative">
                  {/* Balance Display - Bottom Aligned */}
                  <div className="flex items-end justify-between">
                    <span className="text-[50px] font-light leading-none text-white/30">
                      0
                    </span>
                    <span className="text-[13px] font-normal text-white/30">
                      OPENX
                    </span>
                  </div>

                  <div className="absolute inset-0 flex items-center justify-center">
                    <button
                      onClick={() => open()}
                      className="-mt-20 whitespace-nowrap text-center text-[16px] font-bold text-white hover:text-gray-200"
                    >
                      Connect Wallet
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* Connected State */}
                <div className="relative">
                  <div className="flex items-end justify-between">
                    <span className="text-[50px] font-light leading-none text-white">
                      {openxBalancePretty ?? "....."}
                    </span>
                    <span className="text-[13px] font-normal text-white">
                      OPENX
                    </span>
                  </div>

                  {/* Semi-transparent overlay with connected address */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <button
                      onClick={() => open()}
                      className="-mt-20 whitespace-nowrap text-center text-[16px] font-bold text-white hover:text-gray-200"
                    >
                      {address.substring(0, 5)}...{address.substring(37)}
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Social Media Links */}
        <div className="mb-6 mt-4 flex justify-center gap-10 pb-4">
          {SOCIAL_ITEMS.map((item) => (
            <a
              key={item.name}
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
            >
              {item.icon}
            </a>
          ))}
        </div>

        {/* Desktop Menu Items */}
        {SIDE_MENU_ITEMS.map((item) => (
          <NextLink
            key={item.name}
            href={item.href}
            target={item.href.startsWith("https://") ? "_blank" : undefined}
            className={`mb-4 flex items-center space-x-3 rounded-lg p-2 text-white hover:bg-gray-800 ${
              pathname === item.href ? "bg-blue-600" : ""
            }`}
          >
            <span className="text-gray-400">{item.icon}</span>
            <span>{item.name}</span>
          </NextLink>
        ))}
      </div>

      {/* Mobile Menu - shown only when viewport is less than 960px */}
      <div className="fixed inset-x-0 top-0 z-50 bg-white shadow [@media(min-width:960px)]:hidden">
        {/* Top Bar */}
        <div className="flex items-center justify-between px-4 py-2">
          {/* Logo (bigger for mobile) */}
          <div className="flex flex-1 justify-start">
            <NextLink href="https://openxai.org" className="hover:opacity-80">
              <Image
                src="/logo/openxai-logo-black-transparent.png"
                alt="OpenxAI"
                width={140}
                height={60}
                className="object-contain"
              />
            </NextLink>
          </div>
          {/* Social Media Icons in the middle */}
          <div className="flex flex-1 justify-center">
            <div className="flex items-center space-x-4">
              <a
                href="https://x.com/OpenxAINetwork"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-gray-900"
              >
                <svg className="size-7" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              <a
                href="https://t.me/OpenxAINetwork"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-gray-900"
              >
                <svg className="size-7" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M21.93 3.24l-3.35 17.52A1.51 1.51 0 0117.12 22a1.53 1.53 0 01-1.09-.45l-6.9-6.89-3.35 3.35a.49.49 0 01-.35.15.5.5 0 01-.5-.5v-4.29l12.45-12.46a.5.5 0 01-.7.71L4.55 13.75l-2.85-1a1.51 1.51 0 01.1-2.89l18.59-7.15a1.51 1.51 0 011.54 2.53z" />
                </svg>
              </a>
            </div>
          </div>
          {/* Connect Wallet (same height as logo) */}
          <div className="flex flex-1 justify-end">
            <div className="relative">
              {!address ? (
                <button
                  onClick={() => open()}
                  className="flex h-12 items-center rounded-md border px-4 text-base font-bold text-blue-600"
                >
                  Connect Wallet
                </button>
              ) : (
                <span className="flex h-12 items-center text-base font-bold">
                  {openxBalancePretty ?? "..."} OPENX
                </span>
              )}
            </div>
          </div>
        </div>
        {/* Horizontal Navigation Menu */}
        <div className="border-t border-gray-200 px-4 py-2 max-[420px]:px-2 max-[420px]:py-1">
          <div className="flex justify-around">
            {SIDE_MENU_ITEMS.map((item) => (
              <NextLink
                key={item.name}
                href={item.href}
                className="flex flex-col items-center text-gray-600 hover:text-gray-900 max-[500px]:px-1"
              >
                <span className="max-[420px]:scale-90">{item.icon}</span>
                <span className="text-sm max-[500px]:text-xs max-[420px]:text-[10px]">
                  {item.name}
                </span>
              </NextLink>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
