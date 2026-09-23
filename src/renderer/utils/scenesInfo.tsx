import { IconType } from 'react-icons'
import { BsFillSunsetFill, BsSunFill, BsSunriseFill } from 'react-icons/bs'
import {
  FaBed,
  FaCanadianMapleLeaf,
  FaCandyCane,
  FaCouch,
  FaGlasses,
  FaHeart,
  FaMartiniGlass,
  FaMoon,
  FaMugHot,
  FaPalette,
  FaSnowflake,
  FaTv
} from 'react-icons/fa6'
import { GiCandleHolder, GiHighGrass, GiPalmTree, GiSteampunkGoggles } from 'react-icons/gi'
import { HiColorSwatch } from 'react-icons/hi'
import { IoMdMicrophone } from 'react-icons/io'
import { IoFish } from 'react-icons/io5'
import { LuPartyPopper } from 'react-icons/lu'
import { MdForest, MdSunny, MdWaves } from 'react-icons/md'
import { PiFlowerLotusBold, PiTreeFill } from 'react-icons/pi'
import { RiGhostFill, RiPlantFill, RiPulseFill } from 'react-icons/ri'
import { TbCampfireFilled } from 'react-icons/tb'

export type Scene = {
  id: number
  name: string
  icon: IconType
  type: 'static' | 'dynamic'
}

export const scenes: Scene[] = [
  {
    id: 11,
    name: 'warmWhite',
    icon: FaMugHot,
    type: 'static'
  },
  {
    id: 12,
    name: 'dayLight',
    icon: BsSunFill,
    type: 'static'
  },
  {
    id: 13,
    name: 'coldWhite',
    icon: FaSnowflake,
    type: 'static'
  },
  {
    id: 14,
    name: 'nightLight',
    icon: FaMoon,
    type: 'static'
  },
  {
    id: 6,
    name: 'cozy',
    icon: FaCouch,
    type: 'static'
  },
  {
    id: 17,
    name: 'trueColors',
    icon: FaPalette,
    type: 'static'
  },
  {
    id: 16,
    name: 'relax',
    icon: PiFlowerLotusBold,
    type: 'static'
  },
  {
    id: 15,
    name: 'focus',
    icon: FaGlasses,
    type: 'static'
  },
  {
    id: 18,
    name: 'tvTime',
    icon: FaTv,
    type: 'static'
  },
  {
    id: 19,
    name: 'plantGrowth',
    icon: RiPlantFill,
    type: 'static'
  },
  {
    id: 29,
    name: 'candleLight',
    icon: GiCandleHolder,
    type: 'dynamic'
  },
  {
    id: 31,
    name: 'pulse',
    icon: RiPulseFill,
    type: 'dynamic'
  },
  {
    id: 30,
    name: 'goldenWhite',
    icon: MdSunny,
    type: 'dynamic'
  },
  {
    id: 32,
    name: 'steampunk',
    icon: GiSteampunkGoggles,
    type: 'dynamic'
  },
  {
    id: 5,
    name: 'fireplace',
    icon: TbCampfireFilled,
    type: 'dynamic'
  },
  {
    id: 22,
    name: 'fall',
    icon: FaCanadianMapleLeaf,
    type: 'dynamic'
  },
  {
    id: 26,
    name: 'club',
    icon: IoMdMicrophone,
    type: 'dynamic'
  },
  {
    id: 3,
    name: 'sunset',
    icon: BsFillSunsetFill,
    type: 'dynamic'
  },
  {
    id: 2,
    name: 'romance',
    icon: FaHeart,
    type: 'dynamic'
  },
  {
    id: 4,
    name: 'party',
    icon: LuPartyPopper,
    type: 'dynamic'
  },
  {
    id: 8,
    name: 'pastelColors',
    icon: HiColorSwatch,
    type: 'dynamic'
  },
  {
    id: 20,
    name: 'spring',
    icon: PiTreeFill,
    type: 'dynamic'
  },
  {
    id: 21,
    name: 'summer',
    icon: GiPalmTree,
    type: 'dynamic'
  },
  {
    id: 7,
    name: 'forest',
    icon: MdForest,
    type: 'dynamic'
  },
  {
    id: 24,
    name: 'jungle',
    icon: GiHighGrass,
    type: 'dynamic'
  },
  {
    id: 25,
    name: 'mojito',
    icon: FaMartiniGlass,
    type: 'dynamic'
  },
  {
    id: 1,
    name: 'ocean',
    icon: MdWaves,
    type: 'dynamic'
  },
  {
    id: 23,
    name: 'deepDive',
    icon: IoFish,
    type: 'dynamic'
  },
  {
    id: 27,
    name: 'christmas',
    icon: FaCandyCane,
    type: 'dynamic'
  },
  {
    id: 28,
    name: 'halloween',
    icon: RiGhostFill,
    type: 'dynamic'
  },
  {
    id: 10,
    name: 'bedtime',
    icon: FaBed,
    type: 'dynamic'
  },
  {
    id: 9,
    name: 'wakeUp',
    icon: BsSunriseFill,
    type: 'dynamic'
  }
]
