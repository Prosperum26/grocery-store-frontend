"use client"

import { motion } from "framer-motion"
import Image from "next/image"

import LocalizedClientLink from "@modules/common/components/localized-client-link"

const showcaseItems = [
  { title: "Dâu tây", desc: "Đà Lạt, hái trong ngày", img: "/montra/f5.png" },
  { title: "Thịt gà", desc: "Gà ta sơ chế sẵn", img: "/montra/c3.png" },
  { title: "Cá tươi", desc: "Đánh bắt mỗi sáng", img: "/montra/fi3.png" },
  { title: "Trái cây", desc: "Chuẩn VietGAP", img: "/montra/f1.png" },
]

const Hero = () => {
  return (
    <section className="content-container grid grid-cols-1 gap-2 py-8 small:grid-cols-2 small:py-12">
      <div className="flex flex-1 flex-col items-start justify-center gap-4 py-2">
        <div className="flex items-center gap-2 rounded-full bg-orange-100 px-4 py-1">
          <p className="text-base font-bold text-orange-500">Giao nhanh 2 giờ</p>
          <div className="h-8 w-8 overflow-hidden rounded-full bg-white drop-shadow-xl">
            <Image
              src="/montra/delivery.png"
              alt=""
              width={32}
              height={32}
              className="h-full w-full object-contain"
            />
          </div>
        </div>

        <h1 className="text-[2rem] font-bold leading-tight tracking-wide text-headingColor small:text-[3.5rem]">
          Đi chợ tươi ngon, giao tận nhà tại
          <span className="text-[2.4rem] text-orange-600 small:text-[4rem]">
            {" "}
            TP.HCM
          </span>
        </h1>

        <p className="text-base text-textColor small:w-[80%]">
          Rau củ, thịt cá và hàng thiết yếu tươi mỗi ngày, đặt online và nhận
          hàng ngay tại nhà.
        </p>

        <LocalizedClientLink href="/store" className="w-full small:w-auto">
          <motion.span
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="block w-full rounded-lg bg-gradient-to-br from-orange-400 to-orange-500 px-6 py-2 text-center font-semibold text-white transition-shadow duration-100 ease-in-out hover:shadow-lg"
          >
            Mua sắm ngay
          </motion.span>
        </LocalizedClientLink>
      </div>

      <div className="relative flex flex-1 items-center py-2">
        <Image
          src="/montra/hero-bg.png"
          alt=""
          width={500}
          height={550}
          priority
          className="ml-auto h-[420px] w-full small:h-[550px] small:w-auto"
        />
        <div className="absolute inset-0 top-6 grid grid-cols-2 place-content-center justify-items-center gap-x-4 gap-y-14 px-2 small:px-10">
          {showcaseItems.map((item) => (
            <div
              key={item.title}
              className="flex min-h-[140px] min-w-[150px] flex-col items-center justify-center rounded-xl bg-cardOverlay p-2 drop-shadow-lg backdrop-blur-md small:min-h-[200px] small:min-w-[190px]"
            >
              <motion.div
                whileHover={{ scale: 1.1 }}
                className="relative -mt-10 h-24 w-24 small:-mt-16 small:h-36 small:w-36"
              >
                <Image
                  src={item.img}
                  alt={item.title}
                  fill
                  sizes="144px"
                  className="object-contain"
                />
              </motion.div>
              <p className="text-base font-semibold text-textColor small:text-lg">
                {item.title}
              </p>
              <p className="my-2 text-xs font-semibold text-lightGray small:text-sm">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Hero
