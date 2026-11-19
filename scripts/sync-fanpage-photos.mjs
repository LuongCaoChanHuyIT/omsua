import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readdirSync,
  realpathSync,
  unlinkSync,
  writeFileSync,
} from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(SCRIPT_DIR, '..');

function loadSharp() {
  try {
    const nextPkg = realpathSync(
      path.join(REPO_ROOT, 'apps', 'web', 'node_modules', 'next', 'package.json'),
    );
    return createRequire(nextPkg)('sharp');
  } catch {
    const pnpmDir = path.join(REPO_ROOT, 'node_modules', '.pnpm');
    const sharpPkgDir = readdirSync(pnpmDir).find((entry) =>
      entry.startsWith('sharp@'),
    );
    if (sharpPkgDir) {
      const sharpPkg = path.join(
        pnpmDir,
        sharpPkgDir,
        'node_modules',
        'sharp',
        'package.json',
      );
      return createRequire(sharpPkg)('.');
    }
    return createRequire(import.meta.url)('sharp');
  }
}

const sharp = loadSharp();

function normalizeOptions(optionsOrMaxDim) {
  if (typeof optionsOrMaxDim === 'number') {
    return { maxDimension: optionsOrMaxDim, extract: undefined };
  }
  if (optionsOrMaxDim && typeof optionsOrMaxDim === 'object') {
    return {
      maxDimension:
        typeof optionsOrMaxDim.maxDimension === 'number'
          ? optionsOrMaxDim.maxDimension
          : 640,
      extract: optionsOrMaxDim.extract,
    };
  }
  return { maxDimension: 640, extract: undefined };
}

function computePixelExtract(extract, imgWidth, imgHeight) {
  const { left, top, width, height } = extract;
  const nums = [left, top, width, height];
  if (nums.some((val) => typeof val !== 'number' || !Number.isFinite(val))) {
    throw new Error('Invalid extract coordinates: expected finite numbers.');
  }
  if (
    left < 0 ||
    top < 0 ||
    width <= 0 ||
    height <= 0 ||
    left + width > 1.0001 ||
    top + height > 1.0001
  ) {
    throw new Error(
      `Invalid extract box (${left}, ${top}, ${width}, ${height}): must lie within [0, 1].`,
    );
  }

  const pxLeft = Math.max(0, Math.round(left * imgWidth));
  const pxTop = Math.max(0, Math.round(top * imgHeight));
  const pxWidth = Math.min(imgWidth - pxLeft, Math.round(width * imgWidth));
  const pxHeight = Math.min(imgHeight - pxTop, Math.round(height * imgHeight));

  return {
    left: pxLeft,
    top: pxTop,
    width: pxWidth,
    height: pxHeight,
  };
}

/**
 * @param {Buffer} buffer
 * @param {string | null | undefined} contentType
 * @param {number | { maxDimension?: number; extract?: { left: number; top: number; width: number; height: number } }} [optionsOrMaxDim=640]
 */
export async function validateAndOptimizePhotoBuffer(
  buffer,
  contentType,
  optionsOrMaxDim = 640,
) {
  const { maxDimension, extract } = normalizeOptions(optionsOrMaxDim);

  if (
    typeof contentType !== 'string' ||
    !contentType.toLowerCase().trim().startsWith('image/')
  ) {
    throw new Error(
      `Invalid content-type "${String(contentType)}" (expected image/*).`,
    );
  }

  if (!Buffer.isBuffer(buffer) || buffer.byteLength === 0) {
    throw new Error('Image buffer is empty.');
  }

  let metadata;
  try {
    metadata = await sharp(buffer).metadata();
  } catch (cause) {
    throw new Error(
      `Corrupt or unsupported image payload: ${cause instanceof Error ? cause.message : String(cause)}`,
    );
  }

  const swapsAxes = (metadata.orientation ?? 1) >= 5;
  const effectiveWidth = swapsAxes ? metadata.height : metadata.width;
  const effectiveHeight = swapsAxes ? metadata.width : metadata.height;

  if (
    !effectiveWidth ||
    !effectiveHeight ||
    effectiveWidth < 200 ||
    effectiveHeight < 200
  ) {
    throw new Error(
      `Image dimensions too small (${String(effectiveWidth)}x${String(effectiveHeight)}; expected >= 200x200).`,
    );
  }

  let pipeline = sharp(buffer).rotate();

  if (extract) {
    const cropBox = computePixelExtract(
      extract,
      effectiveWidth,
      effectiveHeight,
    );
    if (cropBox.width < 200 || cropBox.height < 200) {
      throw new Error(
        `Extracted image dimensions too small (${String(cropBox.width)}x${String(cropBox.height)}; expected >= 200x200).`,
      );
    }
    pipeline = pipeline.extract(cropBox);
  }

  const { data, info } = await pipeline
    .resize({
      width: maxDimension,
      height: maxDimension,
      fit: 'inside',
      withoutEnlargement: true,
    })
    .webp({ quality: 84, effort: 4 })
    .toBuffer({ resolveWithObject: true });

  return {
    data,
    width: info.width,
    height: info.height,
  };
}

const URLS = {
  // Branches & Space
  branchHoangDieu:
    'https://scontent.fsgn5-1.fna.fbcdn.net/v/t39.30808-6/492006583_1285024350162229_7307278815580420121_n.jpg?stp=dst-jpg_tt6&cstp=mx1252x1252&ctp=s1252x1252&_nc_cat=104&_nc_map=urlgen_bucketless&ccb=1-7&_nc_sid=f727a1&_nc_eui2=AeFT8EFL5jOpSvJdzeocYOea2oEPWlkwQo7agQ9aWTBCjhn4J-MdjuEdMqEck7wty7f8frQjzTmfkjc-ZwIQyR3n&_nc_ohc=PNkDCmSZxqUQ7kNvwGjsLyW&_nc_oc=AdqU3Mve9Llo7snTJECd9EaU9gAaKNN44NmYzJ_a_qZfdR7eXtPin8-U0xVWMWRjh4HH-Qa9_V5rVv547m8NBpzb&_nc_zt=23&_nc_ht=scontent.fsgn5-1.fna&_nc_gid=qwUoU5AOAyn3aXxkseT4MQ&_nc_ss=7b2a8&oh=00_AQTeZgh-MYjgNQd98qAvU8QWiCk3EjQYJG47eLDpGzV9bQ&oe=6B048966',
  branchHem33Nct:
    'https://scontent.fsgn5-10.fna.fbcdn.net/v/t39.30808-6/491043331_1285024300162234_4753694535174971019_n.jpg?stp=dst-jpg_tt6&cstp=mx1250x1250&ctp=s1250x1250&_nc_cat=109&_nc_map=urlgen_bucketless&ccb=1-7&_nc_sid=f727a1&_nc_eui2=AeH4CxJ384_fmeDzeaPq8SlhwOM7ZMviYSzA4ztky-JhLBVNmumkg2hUNu0gvfXb27hRZQ50dxYMx5YO1qxue8BU&_nc_ohc=lFVoQMiFzc0Q7kNvwEuungq&_nc_oc=AdrSm4xRwjp4YlTnEb0KzbSsfxr7CTtB-ffCrCMQjSZKOUyBJAcCPQX_MywPjKVBn0GTdaEgtZvgDYesSUypPiK2&_nc_zt=23&_nc_ht=scontent.fsgn5-10.fna&_nc_gid=EGcbzUzFNOfXA_go8u1zWw&_nc_ss=7b2a8&oh=00_AQQi_Qk6WIk-L3Byw4uzwimvvyTnbH34w7TnwacQyuURQQ&oe=6B04855E',
  branch158Nct:
    'https://scontent.fsgn5-12.fna.fbcdn.net/v/t39.30808-6/518317176_1359309319400398_194368843777350581_n.jpg?stp=dst-jpg_tt6&cstp=mx1474x1842&ctp=s1474x1842&_nc_cat=108&_nc_map=urlgen_bucketless&ccb=1-7&_nc_sid=833d8c&_nc_eui2=AeGnrH8-Eznux0wYE9eUEYJACHF038tJ9LIIcXTfy0n0siIAW1fzHXwp3ijdmzPDzn_OV166tsieQBQKqm31QxDQ&_nc_ohc=EkuIW4bHHfEQ7kNvwEZ626m&_nc_oc=AdokesgL1H5XlY0Tiom4lt8YER8PfsctVfbi2a8a-wg3v25mG8VQ4wO1eqV3yRJ7EMHQkPlb5Ci5tDoiXvscM2ql&_nc_zt=23&_nc_ht=scontent.fsgn5-12.fna&_nc_gid=LFd5FglYZ4jK8FtOe_uzFQ&_nc_ss=7b2a8&oh=00_AQQDug61x32VPI06d_jtq15j8RkHWqQ-05ToRmXCdLx8WA&oe=6B04721F',
  branchDucTrong:
    'https://scontent.fsgn5-2.fna.fbcdn.net/v/t39.30808-6/863511835_1812186644112661_1186378661690163911_n.jpg?stp=dst-jpg_tt6&cstp=mx1536x2048&ctp=s1536x2048&_nc_cat=105&_nc_map=urlgen_bucketless&ccb=1-7&_nc_sid=833d8c&_nc_eui2=AeGaueQeCBqhTcOBHD7DH7ICMN8EyRMPidUw3wTJEw-J1VjPweOAq9gjru1UCPhJRlYI7RMZOpjvp8SCzloy8ZtG&_nc_ohc=kt6IYe4jbr4Q7kNvwEomx57&_nc_oc=Adppv5ZX6_H6SW1FXGkoCkMW41LfKBGmHW4Pj3phD8TBIWW9nBszSanh-EV6-r9e93cAvbGhJWcprpTRJ-ait9iT&_nc_zt=23&_nc_ht=scontent.fsgn5-2.fna&_nc_gid=aLYiPa9y3EgbQS9x_OLoYw&_nc_ss=7b2a8&oh=00_AQQXA1MotPljjBiQEMO06GZUPtMlLQRSfdwnX-CeuMgN5Q&oe=6B046275',
  spaceMorning01:
    'https://scontent.fsgn5-12.fna.fbcdn.net/v/t39.30808-6/548025700_1420044753326854_737510483725628327_n.jpg?stp=dst-jpg_tt6&cstp=mx1366x2048&ctp=s1366x2048&_nc_cat=100&_nc_map=urlgen_bucketless&ccb=1-7&_nc_sid=f727a1&_nc_eui2=AeHq5-0OXNV4WhEH4f5xL6bWX9Xp0E5NhLtf1enQTk2Eu58MzyqysW-FbB-1eFSj7l5wqTVVb6a_lOHgpi-eINhV&_nc_ohc=NHdgyR5GDrYQ7kNvwF54WG6&_nc_oc=AdpFaEeW0lqlYic4VRNWSz5SRKZmIRvppcLVmAodwJt2aOH9KgHwaqL1xGu9BDLowvAQI9UGs2nggbM-pW9j4Wrf&_nc_zt=23&_nc_ht=scontent.fsgn5-12.fna&_nc_gid=LnHvN93esIgrRaQUglcDmQ&_nc_ss=7b2a8&oh=00_AQSVMq-gnccda9M_cJBR2zGJ5atLz5acwv9PkJaY0BUTxw&oe=6B045DDC',
  spaceMorning02:
    'https://scontent.fsgn5-13.fna.fbcdn.net/v/t39.30808-6/549261856_1420044763326853_7200004865330505728_n.jpg?stp=dst-jpg_tt6&cstp=mx1366x2048&ctp=s1366x2048&_nc_cat=105&_nc_map=urlgen_bucketless&ccb=1-7&_nc_sid=f727a1&_nc_eui2=AeHybhC2pG7El50PnrX2QiHz_QjU1lDFYPv9CNTWUMVg-wCx_y_8RMwRdR5iJB1UHy4XDU79JpqozXF4r0V-G_LL&_nc_ohc=EB7AetDC3tcQ7kNvwFxx_Xk&_nc_oc=AdouyxhFB_Z4kUTjjYAz-z_T_MmRo_ELImYbWwidOrL7UFsKT5-HMmN-gbUzhdFfDw50DEvm04zobFHBKfqlBfqX&_nc_zt=23&_nc_ht=scontent.fsgn5-13.fna&_nc_gid=0N1PMdfd3D6D8tFK5C1tvQ&_nc_ss=7b2a8&oh=00_AQTd7Y-NTbUYKd3w4Tx3QXBpL60P4Em89zewftRiTHyobA&oe=6B0484CB',
  spaceStreetDalat:
    'https://scontent.fsgn5-1.fna.fbcdn.net/v/t39.30808-6/492008759_1285024283495569_8542372184927399953_n.jpg?stp=dst-jpg_tt6&cstp=mx1252x1252&ctp=s1252x1252&_nc_cat=100&_nc_map=urlgen_bucketless&ccb=1-7&_nc_sid=f727a1&_nc_eui2=AeFQ2oQKtQAiLQvbehPF-3TPJ0coq4bRvIknRyirhtG8iTD1RMy8LFeOp5Kl0OXysqLMXsPZauZfwtoLPD3WnNlk&_nc_ohc=ldRmEa-20ScQ7kNvwEdJo-n&_nc_oc=AdoPD-kUr1Sr-A4o-DNNM6EbreZii_pS1heRZ_YGrgHi-_QeSnNk3BtOiJz6D6xNlI4sTKdTF73wbkvePU7SBBpb&_nc_zt=23&_nc_ht=scontent.fsgn5-1.fna&_nc_gid=SL5J_3Dw9bi7YPNaKMn-iw&_nc_ss=7b2a8&oh=00_AQQkx7adHoA-Fcls9jDBJoHTwaWQ7eSgW-DKrW7dKBT0lg&oe=6B04892F',
  spaceChoDaLat:
    'https://scontent.fsgn5-22.fna.fbcdn.net/v/t39.30808-6/569019983_1453867183277944_2116466595588687263_n.jpg?stp=dst-jpg_tt6&cstp=mx2048x1536&ctp=s2048x1536&_nc_cat=102&_nc_map=urlgen_bucketless&ccb=1-7&_nc_sid=127cfc&_nc_eui2=AeFc7bigXR9rfo4hNZ2pKiy0vBS5D4ieyUC8FLkPiJ7JQBsreuVOA0R2F6rVibTX0Vl47oDl7RY1RsfJoGjRO9_N&_nc_ohc=YOv64RJYQLkQ7kNvwGDKBG6&_nc_oc=Adqe8XHdFth8cCTPJqcfkRT89kkMu2Z857yor1l4ZDgHQnH-6qoTTa8z1cctU_8M1bPe-Slqfw2z1AQ-prEAXxKa&_nc_zt=23&_nc_ht=scontent.fsgn5-22.fna&_nc_gid=RJ81-cPVx4smsuQNp4K38Q&_nc_ss=7b2a8&oh=00_AQSz3YOIBOJ_Lb2rb1pkgqZ0yB2DNKHzMg5OttFILx3Gpg&oe=6B0457CE',
  spaceTuiToteAtiso:
    'https://scontent.fsgn5-22.fna.fbcdn.net/v/t39.30808-6/569191972_1453867263277936_3504869054990071016_n.jpg?stp=dst-jpg_tt6&cstp=mx2048x2048&ctp=s2048x2048&_nc_cat=102&_nc_map=urlgen_bucketless&ccb=1-7&_nc_sid=127cfc&_nc_eui2=AeEVW3VfwEFCQ2wjaNUXFlLdp4B-ho4eTLyngH6Gjh5MvHz8Z1mCVKHj4Z8HqSimKpuYDr4iOO6sveo-M1c2xRgs&_nc_ohc=yvxoSZpgchYQ7kNvwEUjvRj&_nc_oc=AdqidiuxwXF94y2TMHxs3kL13k0R4d0HWfxSJunHB_Jo7Bz2YzOlVAK1iC-AS9DOSbnTorKcQ_3D4f3CB_kNZ5rx&_nc_zt=23&_nc_ht=scontent.fsgn5-22.fna&_nc_gid=udHUX7PKVH6QMZNBaLNVdg&_nc_ss=7b2a8&oh=00_AQR0Bx8qIOzk1SowupHPvT-medqD-RaNV53Bw_N1pLy99w&oe=6B047DBD',

  // Seasonal & Gallery sets
  galleryAtiso4Bong:
    'https://scontent.fsgn5-3.fna.fbcdn.net/v/t39.30808-6/494202431_1296084379056226_3194349782269131720_n.jpg?stp=cp6_dst-jpg_tt6&cstp=mx1354x1365&ctp=s1354x1365&_nc_cat=111&_nc_map=urlgen_bucketless&ccb=1-7&_nc_sid=833d8c&_nc_eui2=AeE-tet3aXdAXjXvbLNWU-cs4KyJkwpCtLfgrImTCkK0t7vuGvehPm6gmZP05vjOgKcGYZHMR_3HvMJeLAMhsm-z&_nc_ohc=GyXPg7GhIpMQ7kNvwFzzWdO&_nc_oc=AdogK10cLJm8rBDEdES3BUqtVZfdmb9JeSuafVLhzswPmVtCr91ewbksMKd7rszi-R9iC1RncIk_l6vG1jkLx5hu&_nc_zt=23&_nc_ht=scontent.fsgn5-3.fna&_nc_gid=LxrVU46iswR--8leLfrEcA&_nc_ss=7b2a8&oh=00_AQSU9bD86EtcAH5ZM1EUgcAWAhbOMRN8Aw-qMpBEx6Qftw&oe=6B047FB1',
  galleryNongSan3Mon:
    'https://scontent.fsgn5-10.fna.fbcdn.net/v/t39.30808-6/565824621_1452471746750821_6885532626796207567_n.jpg?stp=dst-jpg_tt6&cstp=mx1536x2048&ctp=s1536x2048&_nc_cat=110&_nc_map=urlgen_bucketless&ccb=1-7&_nc_sid=127cfc&_nc_eui2=AeER8x_4VoK6feDK02Sxh8XgnQxssU-kceudDGyxT6Rx69TrPIYgbzvyLEBXB2QByTT0FRumpcwqMmJfXYYOZ5AK&_nc_ohc=DcfjGRXQQv8Q7kNvwF5e4a3&_nc_oc=Adpq1hKX53QpQzgvFIQP0UnXzt55NLqMunMzBqQgzxEz14STCPqz2VemEL10SHTpqNGtjb4U6ynN-BGMiZLQBmhE&_nc_zt=23&_nc_ht=scontent.fsgn5-10.fna&_nc_gid=M04Fz6iCC5kqYcCpN9ESuw&_nc_ss=7b2a8&oh=00_AQRZCRaAMUJRvK5hPd_iEzRHzIRc893b-ezFbfk3WQGK3A&oe=6B0484B5',
  galleryHongTrungLangSolo:
    'https://scontent.fsgn5-15.fna.fbcdn.net/v/t39.30808-6/858051475_1801587188505940_5751016522835112664_n.jpg?stp=dst-jpg_tt6&cstp=mx2048x2048&ctp=s2048x2048&_nc_cat=111&_nc_map=urlgen_bucketless&ccb=1-7&_nc_sid=833d8c&_nc_eui2=AeHDXXCUQ_6GKPQFsnz-SrUdc_hyhG5Cqzhz-HKEbkKrOBW9BL8i-2VeeQSuBZFeZ4ybnygRhnlaQ3kqdw3SbAbY&_nc_ohc=wxt9c7HWm40Q7kNvwHMZpxj&_nc_oc=AdrP2yjJaOwpbrEOVTPEJb9QUbFP_lG7yMiK4O8gVZb8C0wZPh00s_fWWQloE0Os47dNc2L3MwVRJCO3AjMPGnOQ&_nc_zt=23&_nc_ht=scontent.fsgn5-15.fna&_nc_gid=rpg0PWzzH34gIuEc8g6hyA&_nc_ss=7b2a8&oh=00_AQS4x_ozawYORSKnebLMM4EhAIYdseRK1_xO8l4Gu-sk3w&oe=6B045ACD',
  galleryKombuchaSeries:
    'https://scontent.fsgn5-9.fna.fbcdn.net/v/t39.30808-6/497495067_1308025277862136_1219568200440428856_n.jpg?stp=dst-jpg_tt6&cstp=mx1638x2048&ctp=s1638x2048&_nc_cat=101&_nc_map=urlgen_bucketless&ccb=1-7&_nc_sid=127cfc&_nc_eui2=AeHgAojyxotOILip9lqapIMw93jb_gpKLgv3eNv-CkouCz14Ol25ypUu1qfmpyi6TGtqm1rFJ9CHl_RYwsHVYMkC&_nc_ohc=ayrJJkdZ37kQ7kNvwFJ2ceu&_nc_oc=Adoq2nIXm-0_shZM2SqrWU5dLFugyiAg0L_CAiO3g2Zn-nLvFRHemjivlq1Tnw2mZNv6s37VofD9eHlxttlDkGc0&_nc_zt=23&_nc_ht=scontent.fsgn5-9.fna&_nc_gid=MIDm0lKzpSsm23ix0Ckzzw&_nc_ss=7b2a8&oh=00_AQSozLr3fY5m8ZNjeW2bRIERYbv5eU7nlvQ1T06JFU5XqA&oe=6B047F4C',
  posterViNangHaMe:
    'https://scontent.fsgn5-6.fna.fbcdn.net/v/t39.99422-6/727059623_1000112785929272_9165810436798761955_n.png?stp=dst-jpg_tt6&cstp=mx1365x2048&ctp=s1365x2048&_nc_cat=106&_nc_map=urlgen_bucketless&ccb=1-7&_nc_sid=127cfc&_nc_eui2=AeGq_Ak-hGAHTDe9NIg7UUtSEhzb7ud018kSHNvu53TXyVT_GqHCU2CsXpq4NLrzGkZCzqkxHB8KOZDIF73-1F7Z&_nc_ohc=koFCXl6fQYsQ7kNvwHiJKhs&_nc_oc=AdrrOTHg_1_eBDFNjh5MA_Axtn0vOwXdIe8Y2aIL4notY7kVsnPWHLfKXdwDWzqW9d--xWFO8nzIRZ-HQ9sz4Mq4&_nc_zt=14&_nc_ht=scontent.fsgn5-6.fna&_nc_gid=3XFqSSXWa7FvR2V00H8xoA&_nc_ss=7b2a8&oh=00_AQRDi9Poy-guFfmRs0BQx7b4n6PVP0RTN9GJyavHaNgxxQ&oe=6B047804',
  posterMulberrySeason:
    'https://scontent.fsgn5-13.fna.fbcdn.net/v/t39.30808-6/492723918_1293481385983192_8511663928692684871_n.jpg?stp=cp6_dst-jpg_tt6&cstp=mx1080x1351&ctp=s1080x1351&_nc_cat=104&_nc_map=urlgen_bucketless&ccb=1-7&_nc_sid=f727a1&_nc_eui2=AeHdvAyaPv8jOVEUojhhU15FBdvdvKSvhBcF2928pK-EF0H3vt3FINfIC19izmp0Np7t3BrzjhT8k94wHUXQX8y2&_nc_ohc=N1VKgnegO_IQ7kNvwEUczOv&_nc_oc=AdoZVtC3gnaybUPSCkW4ONbgCHXul1S9C_1XYbplC7dZVUkVAhgf9w3AepFlnbH1dHZnPHK1m85LozRC-tf6O33O&_nc_zt=23&_nc_ht=scontent.fsgn5-13.fna&_nc_gid=12KHgzfIxHtMFzBpONjENw&_nc_ss=7b2a8&oh=00_AQR3eY8mcTIV8TnHdJuhqe2uXDJSansTMoz4sCiw4arq9g&oe=6B046EF2',

  // Drinks (Solo & Multi-cup posters)
  drinkTraSuaAtiso:
    'https://scontent.fsgn5-8.fna.fbcdn.net/v/t39.30808-6/491996875_1285024310162233_3428697168946334763_n.jpg?stp=dst-jpg_tt6&cstp=mx2048x2048&ctp=s2048x2048&_nc_cat=102&_nc_map=urlgen_bucketless&ccb=1-7&_nc_sid=f727a1&_nc_eui2=AeG0115XS0lDRb4sPyIYw_ovOVFLymScSrs5UUvKZJxKu8Am05LKmfreB5an8WcyUJE_5lBWRf9IzXPeeMQwIiiM&_nc_ohc=5WbkCmXg2vQQ7kNvwEbRJub&_nc_oc=AdobIxTZK84qZpgN_NE5jTPmCYXFE-a8vN-pAcJ4KdozAovkbMvkRJj6UXVuQ8u4AIDmZk8k3XlQwlM76_fr_MTN&_nc_zt=23&_nc_ht=scontent.fsgn5-8.fna&_nc_gid=VVTiTH5k6QR9MGHjkMZ54w&_nc_ss=7b2a8&oh=00_AQT38LulBVpNCb3k38f9KTLN3VgO1TAOCw3QYS9NuCzoeg&oe=6B047474',
  drinkTraSuaAtisoChuoi:
    'https://scontent.fsgn5-8.fna.fbcdn.net/v/t39.30808-6/566301871_1452471993417463_7890803461898285755_n.jpg?stp=dst-jpg_tt6&cstp=mx1538x2048&ctp=s1538x2048&_nc_cat=109&_nc_map=urlgen_bucketless&ccb=1-7&_nc_sid=127cfc&_nc_eui2=AeHJnH7Tj-pYACipMKZcW5acZJXLWRwTMB9klctZHBMwH3jbrj0_sraxIXW2HX1vuDY9Va1LAm3q4oQshFHRHIdP&_nc_ohc=6Ktbw3Wy3rcQ7kNvwH9IHnR&_nc_oc=AdqR9ztoGj9vDjomTLmKkZytjLoyxo15GszmQnGb67gOdHWNNHvqce5kePdvv4NLQy969ypa0zVkDQb9H-e6rnzl&_nc_zt=23&_nc_ht=scontent.fsgn5-8.fna&_nc_gid=rjM9p481Zr3-4WCUsshpuA&_nc_ss=7b2a8&oh=00_AQT7nZxcs2h57sxH4RQLIuFXIM4sfzXJSSTHmorizjZaNA&oe=6B0463A2',
  drinkTraSuaGaoRang:
    'https://scontent.fsgn5-2.fna.fbcdn.net/v/t39.30808-6/494037384_1295583235773007_7905350622818481341_n.jpg?stp=dst-jpg_tt6&cstp=mx1048x1311&ctp=s1048x1311&_nc_cat=100&_nc_map=urlgen_bucketless&ccb=1-7&_nc_sid=833d8c&_nc_eui2=AeFrKiFJ5_1_dbQBRQeyJva8ZmueHVq1OQ5ma54dWrU5Dlw2p0ajENzzFckrsgDO1VK3HALgDPdil75rTe3Y5zOs&_nc_ohc=J5wngiZW7AkQ7kNvwGtrHDM&_nc_oc=Adqz1ufe6Y0daJKvulA6nrarPkg7dlXW4lp-ZXIC9K-3vWJEJS2ExQrkyK4GPkN65OT69T8K4cgcSy_VQmeBIl_m&_nc_zt=23&_nc_ht=scontent.fsgn5-2.fna&_nc_gid=GzF7fSbTfpncJ6sUeZQVxw&_nc_ss=7b2a8&oh=00_AQS-AiUD3G86jkqcdo33ir-Y7N-Flo3AFscB2C_lxYZpVA&oe=6B04609E',
  drinkTraSuaTiramisu:
    'https://scontent.fsgn5-22.fna.fbcdn.net/v/t39.30808-6/488452923_1270607851603879_3788027040666188451_n.jpg?stp=cp6_dst-jpg_tt6&cstp=mx1556x2048&ctp=s1556x2048&_nc_cat=100&_nc_map=urlgen_bucketless&ccb=1-7&_nc_sid=f727a1&_nc_eui2=AeGR9x0M8uelR7trF1yWpas2qXmrVxlXvyepeatXGVe_J0NwEsc0d0myPQTDzXjKUKaDA9O0-aJGXLIjPWEj1WDe&_nc_ohc=x5KvML89BtEQ7kNvwFt0IaU&_nc_oc=AdpyW8IGuRthJHCSM0c1l9XexE58rtybXFDeYun8e-mD3LqOG2xXq75aiaElYK7lyJztHjaLegoiZ9-xkzRaB1D8&_nc_zt=23&_nc_ht=scontent.fsgn5-22.fna&_nc_gid=e3IXj8aO9icCnH_CjHZ3Pg&_nc_ss=7b2a8&oh=00_AQRuK-VL6oRXzNCl44bgcUM0311Y5MF7Clek8bLt7CLFGQ&oe=6B0484D3',
  drinkOolongSenGung:
    'https://scontent.fsgn5-2.fna.fbcdn.net/v/t39.30808-6/568854882_1453754916622504_4229840527950897988_n.jpg?stp=dst-jpg_tt6&cstp=mx1080x1350&ctp=s1080x1350&_nc_cat=108&_nc_map=urlgen_bucketless&ccb=1-7&_nc_sid=127cfc&_nc_eui2=AeFdOUiCGhLyD9P2FMQO8ZbIEBd1Kxj7bLwQF3UrGPtsvAYS4cjPXtj4ziCL8FcPS-a2vT1PEkZ6axcddi-D5DiK&_nc_ohc=Vl6L7ilQxjwQ7kNvwHpqaoD&_nc_oc=Adpu5c2Ea9VTpgcyaDj5LOKBxH-kxlZ7wFo2peq8O9XA-QxQtf7qy4IYDCr7dWYbvARX_VEEJINVvp45E2wR5_26&_nc_zt=23&_nc_ht=scontent.fsgn5-2.fna&_nc_gid=XrX1d5zjugEXKwRpIHqFvQ&_nc_ss=7b2a8&oh=00_AQRn3Xos5ieqqxR3PEU163JPb3G02C2CVU0SyQW0UZn5zw&oe=6B0484F2',
  drinkQuytNhai:
    'https://scontent.fsgn5-21.fna.fbcdn.net/v/t39.30808-6/619618333_1535984968399498_2149815520543420901_n.jpg?stp=dst-jpg_tt6&cstp=mx1638x2048&ctp=s640x640&_nc_cat=107&_nc_map=urlgen_bucketless&ccb=1-7&_nc_sid=833d8c&_nc_eui2=AeFZaLXn21c9uDoCtuodAEfr5aTux8rpwdvlpO7HyunB2-o9Rny5VowxXOVZwPSWQZXOcqLqoHpz76uq-1HwLv2n&_nc_ohc=qnI9xWxFa_UQ7kNvwG44qfE&_nc_oc=AdqS2-WNnUbTqWFj-golXU8s3YAWt1lN6xBcWvgCE2-eLt2Y4EMUXgBkyTakq0PcyZ6OASjL6YBHI-WMZpG-mTT1&_nc_zt=23&_nc_ht=scontent.fsgn5-21.fna&_nc_gid=OMST3HZ2LIBDCJ0C5tgUJg&_nc_ss=7b2a8&oh=00_AQSz-6aN1g1JUQ3asUEOfE-d5otNMkwpPIHFGX37Wni1dw&oe=6B046985',
  posterAtisoSenChiaDuo:
    'https://scontent.fsgn5-7.fna.fbcdn.net/v/t39.30808-6/493996793_1295573342440663_8554935026684742209_n.jpg?stp=cp6_dst-jpg_tt6&cstp=mx1440x1196&ctp=s1440x1196&_nc_cat=104&_nc_map=urlgen_bucketless&ccb=1-7&_nc_sid=833d8c&_nc_eui2=AeGymT5sfZUPaXpiVKu6XwFdjoet08jYc1aOh63TyNhzVvB3oKzo0qa974dcLo8vOuMkF2aVXtA0__HhiMLxPZR6&_nc_ohc=2rr45NZpgAsQ7kNvwFySSqT&_nc_oc=AdpSfC4YJBxHE5E-FfFyNZ1nVrojluJ7yCUPWE9ZoJfjzLIL6RnaP3O0DGX3ZiupyB_FKoTg8MuC30kOgmDa_6yY&_nc_zt=23&_nc_ht=scontent.fsgn5-7.fna&_nc_gid=q7te-uiImd7NAn64R-7KvQ&_nc_ss=7b2a8&oh=00_AQSV8PZpLlYGDpXOhZjCyQGGD80lbebk0N-xmPqQjTWiCg&oe=6B04855A',
  drinkTraMeDacRim:
    'https://scontent.fsgn5-13.fna.fbcdn.net/v/t39.30808-6/491063812_1284779853520012_2640773170897952585_n.jpg?stp=cp6_dst-jpg_tt6&cstp=mx1414x2000&ctp=s1414x2000&_nc_cat=106&_nc_map=urlgen_bucketless&ccb=1-7&_nc_sid=f727a1&_nc_eui2=AeEH4EXLKTsuVycivFKH_S2mZbgpkQEbVDRluCmRARtUNK9hoTrqp35MYTZSM245BA3GJ8m9QS3fjwBm06MiS6hw&_nc_ohc=Hutlnie5XB0Q7kNvwEGWAwv&_nc_oc=AdppZfb2XyeNGKrxs8JzbCsUG_S1hxYZ2K38PG7xwj8DB2piIYUSHTCLNFwOoBNYUaIy3unNsJNnlCAijD2oHSHb&_nc_zt=23&_nc_ht=scontent.fsgn5-13.fna&_nc_gid=DiEQD0ZJKDdyYU5JSVnSIQ&_nc_ss=7b2a8&oh=00_AQSPrBX8BOW5noB9-dpHWeaFQwSjpPFlAjPLtdDd4paC9g&oe=6B04719C',
  drinkTraSoRiBuoiHong:
    'https://scontent.fsgn5-14.fna.fbcdn.net/v/t39.30808-6/500229397_1319741196690544_6079582872204840112_n.jpg?stp=dst-jpg_tt6&cstp=mx1536x1920&ctp=s1536x1920&_nc_cat=110&_nc_map=urlgen_bucketless&ccb=1-7&_nc_sid=127cfc&_nc_eui2=AeE9WFoPKhaaEpg7S2IP3GLzoplKrH_aznaimUqsf9rOdoFPPHdy8f49RvQ1JxieTQLxlnqwyjIMqhUkKNhSJMTk&_nc_ohc=eZ1sQZp7rooQ7kNvwF8NxhA&_nc_oc=AdqJz9-D3YesdGE7O225uKHBq-pUGRG43gYgfVLwTlA0cB8pqmKrxOYcARFRTc-5sHevKUEA2FG7EExW0jIdcd3G&_nc_zt=23&_nc_ht=scontent.fsgn5-14.fna&_nc_gid=O7JqvcczDhK7nBSW9WEw2Q&_nc_ss=7b2a8&oh=00_AQSc6NO_BndqWfZDpVws-fG51Qbb1Hi2sZMxRs0pEVeBBA&oe=6B045AD8',
  drinkKombuchaChanhVang:
    'https://scontent.fsgn5-21.fna.fbcdn.net/v/t39.30808-6/497503685_1308022824529048_7906672572553560310_n.jpg?stp=dst-jpg_tt6&cstp=mx2048x2048&ctp=s2048x2048&_nc_cat=107&_nc_map=urlgen_bucketless&ccb=1-7&_nc_sid=127cfc&_nc_eui2=AeE8kGAMwIXBz525SGq0_g3snb53GnLNT8Sdvncacs1PxJjxe_S1kYfp-G7ca74_RpPDrWvJmJSfHtSoBFrdbKpv&_nc_ohc=KE0DbeXOPVwQ7kNvwEREuMf&_nc_oc=AdpQ_F0o3ZFZvi-JxH5l86DNncQaJHg-MvzNO7tuf6G6EgPlirTkpV9YvpGgKIAe7z4Wb70bAb6DHaW_KZMMGvKb&_nc_zt=23&_nc_ht=scontent.fsgn5-21.fna&_nc_gid=Lorjvd6LUnxqHcO3-RbCQw&_nc_ss=7b2a8&oh=00_AQRJ9VJDMOAQ921TTDmS2LTsx5Yn_Jb3m1SQqm-cVjOFBQ&oe=6B047901',
  drinkSuaTuoiKemTrung:
    'https://scontent.fsgn5-12.fna.fbcdn.net/v/t39.30808-6/487819027_1266902618641069_7807282071494355630_n.jpg?stp=dst-jpg_tt6&cstp=mx1545x2000&ctp=s1545x2000&_nc_cat=103&_nc_map=urlgen_bucketless&ccb=1-7&_nc_sid=f727a1&_nc_eui2=AeFtRfdA0LWqnWcwt1IlFyZuVDtXoN86sElUO1eg3zqwSStO5HWNBOtqOZV1EBKOWAt4Lavm5QuRhFwHl8tKe04W&_nc_ohc=EsYcM7-Pb0cQ7kNvwHxNy24&_nc_oc=AdrQCyUN5Akhx-rrOi5mhX4IxVvBcTBOKYNuELYYGcyQxPjrVW-4Z68KJGUM_2gbUgRs1aUdHYBLho0hZ_9y8TAE&_nc_zt=23&_nc_ht=scontent.fsgn5-12.fna&_nc_gid=vso2-P3IzAUI3563FoQXnQ&_nc_ss=7b2a8&oh=00_AQRYujjxPz4vGAPplE_GUJ58qYKsBQclKk6qSJpTpMjL7w&oe=6B047A03',
  drinkMatchaLatte:
    'https://scontent.fsgn5-12.fna.fbcdn.net/v/t39.30808-6/543181062_1408975524433777_2588488351793530384_n.jpg?stp=cp6_dst-jpg_tt6&cstp=mx1080x1351&ctp=s1080x1351&_nc_cat=101&_nc_map=urlgen_bucketless&ccb=1-7&_nc_sid=f727a1&_nc_eui2=AeETcTCZZC6uLu_xJlXLDPSKroV1j3HWXniuhXWPcdZeeDA0EMLjQqAVaZTcDLydjNRhIMrqVLLuqe1DNDvbtcWw&_nc_ohc=l3fre8UVzN8Q7kNvwHkyZmO&_nc_oc=AdowxVSGTbB3JNOq_-jChQ8aCJVHz4iFBqsuNQTrRo4bT3kB3pQLiyKbwPGn3IQGdDKdOoi_03UwwFUPvASdmraM&_nc_zt=23&_nc_ht=scontent.fsgn5-12.fna&_nc_gid=aufVIgO9sgkMRrJhQJHMWg&_nc_ss=7b2a8&oh=00_AQQho1TjgZnqrSkDuEa5vovkBvEX7Nxlwj9Rjvb_HhPYLQ&oe=6B044E41',
  drinkOreoTraDaXay:
    'https://scontent.fsgn5-2.fna.fbcdn.net/v/t39.30808-6/490018510_1275248874473110_4571387760555726692_n.jpg?stp=dst-jpg_tt6&cstp=mx1080x1351&ctp=s1080x1351&_nc_cat=104&_nc_map=urlgen_bucketless&ccb=1-7&_nc_sid=f727a1&_nc_eui2=AeFcwA15HmNJuCAJH5zJVMhxMEbVrVkxQEgwRtWtWTFASKSJBBIGeQiyKisk-NIAbXWyWDdgeln5L-jI3ZMdOVur&_nc_ohc=SNVweMSdNFUQ7kNvwF62ybd&_nc_oc=AdqSG70tutdBXCQwJjiP31cKxPIh39EpRHD1n4ZM31jc6Oe_3VjGNVp8OUkqhtQUgB8UU4azu3Nk6I_FrwwB3KkE&_nc_zt=23&_nc_ht=scontent.fsgn5-2.fna&_nc_gid=ySOBoTe5lrsfRpMo448irw&_nc_ss=7b2a8&oh=00_AQSTHtwZt_F0BGf-zoclx8uEMvFO93Wmy5tO38y7ISeBHQ&oe=6B047E88',
  drinkMatchaOreoDaXay:
    'https://scontent.fsgn5-22.fna.fbcdn.net/v/t39.30808-6/488013417_1269892438342087_3604708506136697755_n.jpg?stp=cp6_dst-jpg_tt6&cstp=mx1536x2048&ctp=s1536x2048&_nc_cat=111&_nc_map=urlgen_bucketless&ccb=1-7&_nc_sid=833d8c&_nc_eui2=AeH7l0wBxk2nLYpY9VKF8j-ikmhq8aOxc7KSaGrxo7Fzsgol1fG8tTkMPeOIfF2VNT659iJlCFtOHrgZS0NZaIxR&_nc_ohc=gY7Z1M0Slt8Q7kNvwFOf5Mx&_nc_oc=Ado5yIt1dz-nAD8MLIMkI3MiuU1erU9npbacdUsCLbPiY24Z1XGaYSD_tj16OtTNlsNdD-sVQJDuw0EFY-kGKGrp&_nc_zt=23&_nc_ht=scontent.fsgn5-22.fna&_nc_gid=eBmtzt31d1neGQHH7KYgTg&_nc_ss=7b2a8&oh=00_AQSkWEYW0sPuzIX7ivosYuQvaHczRVBd2b4pbwsRBm-9ew&oe=6B0481DB',
  posterBacXiuCaPheMuoi:
    'https://scontent.fsgn5-14.fna.fbcdn.net/v/t39.30808-6/493685741_1293237769340887_2654817426972789318_n.jpg?stp=dst-jpg_tt6&cstp=mx1080x1351&ctp=s1080x1351&_nc_cat=110&_nc_map=urlgen_bucketless&ccb=1-7&_nc_sid=833d8c&_nc_eui2=AeEM4MvwdZpTBjYfncFepfiQChoI2H0Vr78KGgjYfRWvv7w0NhkPsEFjy8AleA5ru72zhf3W5oUr-xEjtFYBMAsq&_nc_ohc=haFrt8cqK9oQ7kNvwH1TEl_&_nc_oc=AdpB7QVTNcYhnJkDUPkxa8jDW1LT99l58pInKOuFvnIAUdZ3j1iYLbcXyp43R03ls-vxV8SY-7d0ij9mjZ3B4Kal&_nc_zt=23&_nc_ht=scontent.fsgn5-14.fna&_nc_gid=8e5xWehZLU6nFMZnIrcyqQ&_nc_ss=7b2a8&oh=00_AQRguigAWgpAfEzkaHWj5LRNGJG1zJrK4BXJVOO48tuX0w&oe=6B045968',
  drinkCaPheTiramisu:
    'https://scontent.fsgn5-18.fna.fbcdn.net/v/t39.30808-6/491396372_1282852653712732_1880512663039686558_n.jpg?stp=dst-jpg_tt6&cstp=mx1080x1351&ctp=s1080x1351&_nc_cat=106&_nc_map=urlgen_bucketless&ccb=1-7&_nc_sid=f727a1&_nc_eui2=AeFR8NuBQSIPwFRis2Yr6w249eQkoF8av0L15CSgXxq_QgNLEOOC0otWPrxIUqnA2d0vG52j7RsVWYieqn5L6Jxj&_nc_ohc=mfy-ZNdkIewQ7kNvwGHA0YY&_nc_oc=AdpXX9C6BH6ujwgw2-8qzqewdj_2H0cMiOmMbqOcFeZhLVjBTUMh0IYrKnohoe-oQLEbtbfbsXm1vEsBmS9K_omu&_nc_zt=23&_nc_ht=scontent.fsgn5-18.fna&_nc_gid=nfNSALP7CcVSVt7EgiezGg&_nc_ss=7b2a8&oh=00_AQRdWbqLdxoRC7fLK84MnKIHHK-sqBRo74vRmVnYI_VCwg&oe=6B0486D7',
  posterCoffeeTrio:
    'https://scontent.fsgn5-3.fna.fbcdn.net/v/t39.30808-6/489624159_1277775404220457_5015849322556943084_n.jpg?stp=dst-jpg_tt6&cstp=mx1079x1350&ctp=s1079x1350&_nc_cat=108&_nc_map=urlgen_bucketless&ccb=1-7&_nc_sid=f727a1&_nc_eui2=AeEHmvWXXPe1zSy5DZdPKR_tsZfuutVwTVOxl-661XBNUzRXC4-sZ7tv3zgz9iE_AYfr2EQkCvesfuCKy6oIFild&_nc_ohc=45o5EAEKPywQ7kNvwEsaH6-&_nc_oc=AdpcV8rJDa_yNpVGPP3aayTD4nyB9yr0XUZ87PsGuz3A8yqGy79mzIdWgyWRJ0Hc8t0gRGVnD2whRDnM6DBWZ0kK&_nc_zt=23&_nc_ht=scontent.fsgn5-3.fna&_nc_gid=S08NNX3r1aRsyw1GaGbExA&_nc_ss=7b2a8&oh=00_AQQkRrGDsh5xDppkZpKtB3K2Mr0LW_bW5cSZSH4yvUl_lw&oe=6B046B46',

  // Snacks (6/6 distinct 1:1)
  posterMonMoi5Mon:
    'https://scontent.fsgn5-1.fna.fbcdn.net/v/t39.30808-6/494004142_1292530696078261_5310326484433449704_n.jpg?stp=dst-jpg_tt6&cstp=mx1732x2048&ctp=s1732x2048&_nc_cat=104&_nc_map=urlgen_bucketless&ccb=1-7&_nc_sid=f727a1&_nc_eui2=AeE6w1lPEXlc9jkjNC5XvefXqaeaozwJfmypp5qjPAl-bCIsWZ17ZI6ef9wfrm1ATlw88IL1SZf8HKkuhYrmIr90&_nc_ohc=AtnUvyfMasYQ7kNvwEiHUGw&_nc_oc=AdpyvdQ1k4VrNP1gMpRTKgG0znIzf9I_8vIhsP1ikKo9cbOgUmGqJ1GrRksRm5L6WiwzrAIoK8H0zza6uiGr7-0i&_nc_zt=23&_nc_ht=scontent.fsgn5-1.fna&_nc_gid=kBf5bFKvPauZDqXvYB8crQ&_nc_ss=7b2a8&oh=00_AQRWQCEMxYToT-CGQ2_DPY1YqZPzLYs7mY9JCV8Yc-LtPg&oe=6B047840',
  snackComChayChaBong:
    'https://scontent.fsgn5-9.fna.fbcdn.net/v/t39.30808-6/491918450_1290274302970567_4898634575634315689_n.jpg?stp=dst-jpg_tt6&cstp=mx1080x1351&ctp=s1080x1351&_nc_cat=103&_nc_map=urlgen_bucketless&ccb=1-7&_nc_sid=f727a1&_nc_eui2=AeGMd-HtA1c4R1C6qRxqMnh3x2d1chCSkvDHZ3VyEJKS8L-NEYHxwjqTwbVd_Y5splx3RdgF9wV3XWcP64t9r_6J&_nc_ohc=UsHI52eGchwQ7kNvwFZupfX&_nc_oc=AdpPrCpe9RtRps2W5sa-t5OTlh4gHSRUcjw0hSXL6tShTqJyamgLzLQ3-Xd8_N6WDB_Xv7VReiuBYi8wQ2W5LYBd&_nc_zt=23&_nc_ht=scontent.fsgn5-9.fna&_nc_gid=0_5dCsxNHwU80o3xXM2vRg&_nc_ss=7b2a8&oh=00_AQRFHIaSNum0HkQfgCInfMxQ_nO48YI9wsrL_kfPeH4_pw&oe=6B046A37',
  snackCuonBo:
    'https://scontent.fsgn5-10.fna.fbcdn.net/v/t39.30808-6/491130144_1283149267016404_520390037781484479_n.jpg?stp=dst-jpg_tt6&cstp=mx1536x2048&ctp=s1536x2048&_nc_cat=103&_nc_map=urlgen_bucketless&ccb=1-7&_nc_sid=f727a1&_nc_eui2=AeEMxHTAewjwjrGNnBOUXjEQ3fY0iMGFroPd9jSIwYWug462q9FTnlsb06YWrGFUXvCUaOdSYnY8zUhpCarO4H0T&_nc_ohc=fQLqGkpnpngQ7kNvwFkfRzV&_nc_oc=AdrM0qJ6PGpWqhpXFRFBDuUKlbOoUeXH83R0A3ea7wyYIpK3-wl4freAUw3ntjxhznyp9BvXZYK2zL56yTJgqNfy&_nc_zt=23&_nc_ht=scontent.fsgn5-10.fna&_nc_gid=P8ECUtyo8HGMO8QA84yeFQ&_nc_ss=7b2a8&oh=00_AQSqN-BWXgYc1IexrwCl5kXSqfpbCDWYf_VohfFcrdypQQ&oe=6B047D76',
  snackSotTac:
    'https://scontent.fsgn5-22.fna.fbcdn.net/v/t39.30808-6/487414781_1268933241771340_1429769129729889271_n.jpg?stp=cp6_dst-jpg_tt6&cstp=mx1634x2048&ctp=s1634x2048&_nc_cat=110&_nc_map=urlgen_bucketless&ccb=1-7&_nc_sid=f727a1&_nc_eui2=AeEH6NtAWVgxHYJyZhdvHAL1QMIbPTnjp0hAwhs9OeOnSBGG_uqESFole-DrEqFZrXYR8M9H2_5CR00WxQjnOdwH&_nc_ohc=uRd5S_bi4a8Q7kNvwH1f4Cu&_nc_oc=AdoVcJvfn2zLwpUktNiB11LCudQ95bUwHULxjyOpQUCpmOgnI5lyog4LucusrgGtjHlfIer5cJ4nyOvtYxkcT4J_&_nc_zt=23&_nc_ht=scontent.fsgn5-22.fna&_nc_gid=uioeWf9kft7iU17pjCr1IA&_nc_ss=7b2a8&oh=00_AQQ4QTXQxL_SV5TwAsmHNBbxB9ajKBTpJoYaezU-Uo_HIQ&oe=6B0466A6',
  snackPhoiSuongToiOt:
    'https://scontent.fsgn5-11.fna.fbcdn.net/v/t39.30808-6/490071211_1278181294179868_6909160500408163526_n.jpg?stp=dst-jpg_tt6&cstp=mx1536x2048&ctp=s1536x2048&_nc_cat=105&_nc_map=urlgen_bucketless&ccb=1-7&_nc_sid=f727a1&_nc_eui2=AeFg77XUiXGL8-IpBzJOLnz4WeW2HjLelqxZ5bYeMt6WrIdbwgWf1mVBNXPfFkpvU6tE9snn9GfIR8WYOT2jBMCf&_nc_ohc=0-SRxGOuTVwQ7kNvwHnYFeh&_nc_oc=AdpSA0s5WXWq_NNgWvn6PxsueqWKzhtt6kCI2k_fK6s-HWtN2ewrGL1mjWfajZXhRFZly5AzyrboCyaaNcRfvYXD&_nc_zt=23&_nc_ht=scontent.fsgn5-11.fna&_nc_gid=6mRy9vq7CUgkPB6frPBBrg&_nc_ss=7b2a8&oh=00_AQRclIkFAkGytQSmolRIvqLmirJe8LhW5duvfF0rxbgVcA&oe=6B04690B',
  snackChamLongDao:
    'https://scontent.fsgn5-18.fna.fbcdn.net/v/t39.30808-6/487171999_1266908505307147_8743356903196529238_n.jpg?stp=cp6_dst-jpg_tt6&cstp=mx2048x2048&ctp=s2048x2048&_nc_cat=107&_nc_map=urlgen_bucketless&ccb=1-7&_nc_sid=f727a1&_nc_eui2=AeHOFs6ePlM8lVvDv9QdMYL_GBHeALpN3tUYEd4Auk3e1TtYDU0b80zaRRIRpPMK_LkDWwdfj61twE70MaCXDC-8&_nc_ohc=0q9HVf1Xb_QQ7kNvwEuTzv-&_nc_oc=Adr1YxJIOLwqx5wHgssyBS9VH3zlDVjXMRkgvsKMn-jh9dHW9IUrZh7FS4LH4F_jkIKgWSwIDzcqFwTbDvknhtg5&_nc_zt=23&_nc_ht=scontent.fsgn5-18.fna&_nc_gid=Ihpn6E9HfNynAyLyOJK2rQ&_nc_ss=7b2a8&oh=00_AQSkDCAZfaBEJHVl-zoO1tiMiKDgIdhPc-NXlKas2tWoAQ&oe=6B045AB8',

  // Toppings Macro
  toppingHatSen:
    'https://scontent.fsgn5-21.fna.fbcdn.net/v/t39.30808-6/568688925_1453741199957209_6871858133310282363_n.jpg?stp=dst-jpg_tt6&cstp=mx1638x2048&ctp=s1638x2048&_nc_cat=108&_nc_map=urlgen_bucketless&ccb=1-7&_nc_sid=127cfc&_nc_eui2=AeGCrpJLz7mMey9nrIxuTopp1_LNc2r3kSrX8s1zaveRKrcc1njfOpRVufYrDvWjTrEaGlsjV15j3x9yab0OPz1v&_nc_ohc=7FoCbJ_1oR0Q7kNvwFYjFn-&_nc_oc=AdrJCHMtFcdelJ7BGgCop7vZoyd1-pGr20oTaNyUu2Fafsns6iTf9qtePlRy0eKWlKZo15u5JisZ-OUnkal2bAoY&_nc_zt=23&_nc_ht=scontent.fsgn5-21.fna&_nc_gid=aaBTzPwb5dfYay4gLAe6wQ&_nc_ss=7b2a8&oh=00_AQTnY4-PKCZ63ZiNpQvfmfPQqWiIuc01hICzQ1t95wRpqA&oe=6B047DE7',
  toppingKhucBach:
    'https://scontent.fsgn5-15.fna.fbcdn.net/v/t39.30808-6/490832270_1290224659642198_2631321584926189526_n.jpg?stp=cp6_dst-jpg_tt6&cstp=mx1131x1379&ctp=s1131x1379&_nc_cat=104&_nc_map=urlgen_bucketless&ccb=1-7&_nc_sid=f727a1&_nc_eui2=AeGDePSd0wq28YK2pPL6Jv-nzAP1akD-2mrMA_VqQP7aavqt_lZPRuCTrP1CVdjwRiypTjZRyHIntH_x8dV91v41&_nc_ohc=b9UXrwSZVyMQ7kNvwEnf99a&_nc_oc=AdqueRuHGJ3ddvhO0LHkCRU_YfgPvIElx6b9wwCbUjM8V4mBYryl-IOvhYOCm0UPUHT1eXIkzXZJ-rTnZmqjJH8R&_nc_zt=23&_nc_ht=scontent.fsgn5-15.fna&_nc_gid=1-7v9b2JEuRGX5-Q0cWjug&_nc_ss=7b2a8&oh=00_AQTU1otXTWsq74gAQU4gdlMrlZXgIWVKRef5MIEDR384rw&oe=6B046899',
};

export const FANPAGE_PHOTO_SOURCES = [
  // 1. Branches (4/4)
  {
    relPath: 'branches/branch-cs1-hoang-dieu.webp',
    mirrorToAdmin: true,
    maxDimension: 960,
    url: URLS.branchHoangDieu,
  },
  {
    relPath: 'branches/branch-cs2-hem-33-nct.webp',
    mirrorToAdmin: true,
    maxDimension: 960,
    url: URLS.branchHem33Nct,
  },
  {
    relPath: 'branches/branch-cs3-158-nct.webp',
    mirrorToAdmin: true,
    maxDimension: 960,
    url: URLS.branch158Nct,
  },
  {
    relPath: 'branches/branch-cs4-duc-trong.webp',
    mirrorToAdmin: true,
    maxDimension: 960,
    url: URLS.branchDucTrong,
  },

  // 2. Space & Seasonal Gallery (High-Res 1200px)
  {
    relPath: 'space/space-morning-01.webp',
    mirrorToAdmin: false,
    maxDimension: 1200,
    url: URLS.spaceMorning01,
  },
  {
    relPath: 'space/space-morning-02.webp',
    mirrorToAdmin: false,
    maxDimension: 1200,
    url: URLS.spaceMorning02,
  },
  {
    relPath: 'space/space-street-dalat.webp',
    mirrorToAdmin: false,
    maxDimension: 1200,
    url: URLS.spaceStreetDalat,
  },
  {
    relPath: 'space/space-cho-da-lat-da-quy.webp',
    mirrorToAdmin: false,
    maxDimension: 1200,
    url: URLS.spaceChoDaLat,
  },
  {
    relPath: 'space/space-tui-tote-atiso.webp',
    mirrorToAdmin: false,
    maxDimension: 1200,
    url: URLS.spaceTuiToteAtiso,
  },
  {
    relPath: 'seasonal/gallery-atiso-4-bong.webp',
    mirrorToAdmin: false,
    maxDimension: 1200,
    url: URLS.galleryAtiso4Bong,
  },
  {
    relPath: 'seasonal/gallery-nong-san-da-lat.webp',
    mirrorToAdmin: false,
    maxDimension: 1200,
    url: URLS.galleryNongSan3Mon,
  },
  {
    relPath: 'seasonal/gallery-hong-trung-lang.webp',
    mirrorToAdmin: false,
    maxDimension: 1200,
    url: URLS.galleryHongTrungLangSolo,
  },
  {
    relPath: 'seasonal/gallery-kombucha-series.webp',
    mirrorToAdmin: false,
    maxDimension: 1200,
    url: URLS.galleryKombuchaSeries,
  },
  {
    relPath: 'seasonal/gallery-vi-nang-ha-me.webp',
    mirrorToAdmin: false,
    maxDimension: 1200,
    url: URLS.posterViNangHaMe,
  },
  {
    relPath: 'seasonal/gallery-mulberry-season.webp',
    mirrorToAdmin: false,
    maxDimension: 1200,
    url: URLS.posterMulberrySeason,
  },

  // 3. Drinks (21/24 distinct 1:1)
  {
    relPath: 'products/drink-tra-sua-atiso.webp',
    mirrorToAdmin: false,
    maxDimension: 720,
    url: URLS.drinkTraSuaAtiso,
  },
  {
    relPath: 'products/drink-tra-sua-atiso-chuoi.webp',
    mirrorToAdmin: false,
    maxDimension: 720,
    url: URLS.drinkTraSuaAtisoChuoi,
  },
  {
    relPath: 'products/drink-tra-sua-gao-rang-khuc-bach.webp',
    mirrorToAdmin: false,
    maxDimension: 720,
    url: URLS.drinkTraSuaGaoRang,
  },
  {
    relPath: 'products/drink-tra-sua-tiramisu.webp',
    mirrorToAdmin: false,
    maxDimension: 720,
    url: URLS.drinkTraSuaTiramisu,
  },
  {
    relPath: 'products/drink-oolong-sen-gung.webp',
    mirrorToAdmin: false,
    maxDimension: 720,
    url: URLS.drinkOolongSenGung,
  },
  {
    relPath: 'products/drink-quyt-nhai-cat-tuong.webp',
    mirrorToAdmin: false,
    maxDimension: 720,
    extract: { left: 0.02, top: 0.22, width: 0.52, height: 0.68 },
    url: URLS.drinkQuytNhai,
  },
  {
    relPath: 'products/drink-tra-atiso-sen-chia.webp',
    mirrorToAdmin: false,
    maxDimension: 720,
    extract: { left: 0.03, top: 0.11, width: 0.45, height: 0.85 },
    url: URLS.posterAtisoSenChiaDuo,
  },
  {
    relPath: 'products/drink-tra-dau-tam-da-lat.webp',
    mirrorToAdmin: false,
    maxDimension: 720,
    extract: { left: 0.04, top: 0.20, width: 0.35, height: 0.70 },
    url: URLS.posterMulberrySeason,
  },
  {
    relPath: 'products/drink-tra-me-thot-not.webp',
    mirrorToAdmin: false,
    maxDimension: 720,
    url: URLS.drinkTraMeDacRim,
  },
  {
    relPath: 'products/drink-tra-so-ri-buoi-hong.webp',
    mirrorToAdmin: false,
    maxDimension: 720,
    url: URLS.drinkTraSoRiBuoiHong,
  },
  {
    relPath: 'products/drink-kombucha-chanh-vang.webp',
    mirrorToAdmin: false,
    maxDimension: 720,
    extract: { left: 0.45, top: 0.08, width: 0.53, height: 0.88 },
    url: URLS.drinkKombuchaChanhVang,
  },
  {
    relPath: 'products/drink-sua-tuoi-kem-trung-nuong.webp',
    mirrorToAdmin: false,
    maxDimension: 720,
    url: URLS.drinkSuaTuoiKemTrung,
  },
  {
    relPath: 'products/drink-matcha-latte.webp',
    mirrorToAdmin: false,
    maxDimension: 720,
    extract: { left: 0.46, top: 0.46, width: 0.52, height: 0.52 },
    url: URLS.drinkMatchaLatte,
  },
  {
    relPath: 'products/drink-oreo-tra-da-xay.webp',
    mirrorToAdmin: false,
    maxDimension: 720,
    extract: { left: 0.06, top: 0.36, width: 0.72, height: 0.64 },
    url: URLS.drinkOreoTraDaXay,
  },
  {
    relPath: 'products/drink-matcha-oreo-da-xay.webp',
    mirrorToAdmin: false,
    maxDimension: 720,
    url: URLS.drinkMatchaOreoDaXay,
  },
  {
    relPath: 'products/drink-yogurt-dau-tam.webp',
    mirrorToAdmin: false,
    maxDimension: 720,
    extract: { left: 0.27, top: 0.41, width: 0.46, height: 0.54 },
    url: URLS.posterMulberrySeason,
  },
  {
    relPath: 'products/drink-cold-brew-me.webp',
    mirrorToAdmin: false,
    maxDimension: 720,
    extract: { left: 0.57, top: 0.31, width: 0.41, height: 0.44 },
    url: URLS.posterViNangHaMe,
  },
  {
    relPath: 'products/drink-ca-phe-muoi.webp',
    mirrorToAdmin: false,
    maxDimension: 720,
    extract: { left: 0.50, top: 0.14, width: 0.48, height: 0.80 },
    url: URLS.posterBacXiuCaPheMuoi,
  },
  {
    relPath: 'products/drink-ca-phe-kem-tiramisu.webp',
    mirrorToAdmin: false,
    maxDimension: 720,
    url: URLS.drinkCaPheTiramisu,
  },
  {
    relPath: 'products/drink-ca-phe-sua.webp',
    mirrorToAdmin: false,
    maxDimension: 720,
    extract: { left: 0.58, top: 0.46, width: 0.40, height: 0.52 },
    url: URLS.posterCoffeeTrio,
  },
  {
    relPath: 'products/drink-bac-xiu-da-lat.webp',
    mirrorToAdmin: false,
    maxDimension: 720,
    extract: { left: 0.02, top: 0.14, width: 0.47, height: 0.80 },
    url: URLS.posterBacXiuCaPheMuoi,
  },

  // 4. Snacks (6/6 distinct 1:1)
  {
    relPath: 'products/snack-banh-trang-tron-top-mo.webp',
    mirrorToAdmin: false,
    maxDimension: 720,
    extract: { left: 0.28, top: 0.18, width: 0.50, height: 0.34 },
    url: URLS.posterMonMoi5Mon,
  },
  {
    relPath: 'products/snack-com-chay-cha-bong.webp',
    mirrorToAdmin: false,
    maxDimension: 720,
    url: URLS.snackComChayChaBong,
  },
  {
    relPath: 'products/snack-banh-trang-cuon-bo.webp',
    mirrorToAdmin: false,
    maxDimension: 720,
    url: URLS.snackCuonBo,
  },
  {
    relPath: 'products/snack-banh-trang-sot-tac.webp',
    mirrorToAdmin: false,
    maxDimension: 720,
    url: URLS.snackSotTac,
  },
  {
    relPath: 'products/snack-phoi-suong-toi-ot.webp',
    mirrorToAdmin: false,
    maxDimension: 720,
    url: URLS.snackPhoiSuongToiOt,
  },
  {
    relPath: 'products/snack-banh-cham-long-dao.webp',
    mirrorToAdmin: false,
    maxDimension: 720,
    extract: { left: 0.26, top: 0.54, width: 0.72, height: 0.46 },
    url: URLS.posterMonMoi5Mon,
  },

  // 5. Toppings (Macro bowls & close-ups)
  {
    relPath: 'products/topping-hat-sen.webp',
    mirrorToAdmin: false,
    maxDimension: 512,
    url: URLS.toppingHatSen,
  },
  {
    relPath: 'products/topping-khuc-bach.webp',
    mirrorToAdmin: false,
    maxDimension: 512,
    url: URLS.toppingKhucBach,
  },
  {
    relPath: 'products/topping-kem-trung.webp',
    mirrorToAdmin: false,
    maxDimension: 512,
    extract: { left: 0.22, top: 0.06, width: 0.68, height: 0.52 },
    url: URLS.drinkSuaTuoiKemTrung,
  },
  {
    relPath: 'products/topping-tran-chau-den.webp',
    mirrorToAdmin: false,
    maxDimension: 512,
    extract: { left: 0.58, top: 0.72, width: 0.42, height: 0.28 },
    url: URLS.drinkTraSuaAtisoChuoi,
  },
  {
    relPath: 'products/topping-hat-dac-rim.webp',
    mirrorToAdmin: false,
    maxDimension: 512,
    extract: { left: 0.26, top: 0.34, width: 0.50, height: 0.28 },
    url: URLS.drinkTraMeDacRim,
  },
];

function collectWebpFiles(dirPath) {
  if (!existsSync(dirPath)) {
    return [];
  }
  const results = [];
  for (const entry of readdirSync(dirPath, { withFileTypes: true })) {
    const child = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      results.push(...collectWebpFiles(child));
    } else if (entry.isFile() && entry.name.endsWith('.webp')) {
      results.push(child);
    }
  }
  return results;
}

export async function syncAllFanpagePhotos() {
  const webBase = path.join(
    REPO_ROOT,
    'apps',
    'web',
    'public',
    'images',
    'fanpage',
  );
  const adminBase = path.join(
    REPO_ROOT,
    'apps',
    'admin',
    'public',
    'images',
    'fanpage',
  );

  const expectedWebPaths = new Set();
  const expectedAdminPaths = new Set();
  const downloadCache = new Map();

  for (const entry of FANPAGE_PHOTO_SOURCES) {
    let cached = downloadCache.get(entry.url);
    if (!cached) {
      const response = await fetch(entry.url, {
        signal: AbortSignal.timeout(15_000),
        headers: {
          'User-Agent':
            'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
          Accept: 'image/avif,image/webp,image/apng,image/*,*/*;q=0.8',
        },
      });

      if (!response.ok) {
        throw new Error(
          `Failed to download ${entry.relPath}: HTTP ${String(response.status)}`,
        );
      }

      cached = {
        rawBuffer: Buffer.from(await response.arrayBuffer()),
        contentType: response.headers.get('content-type'),
      };
      downloadCache.set(entry.url, cached);
    }

    const { data, width, height } = await validateAndOptimizePhotoBuffer(
      cached.rawBuffer,
      cached.contentType,
      {
        maxDimension: entry.maxDimension,
        extract: entry.extract,
      },
    );

    const webDest = path.join(webBase, entry.relPath);
    expectedWebPaths.add(path.resolve(webDest));
    mkdirSync(path.dirname(webDest), { recursive: true });
    writeFileSync(webDest, data);

    if (entry.mirrorToAdmin) {
      const adminDest = path.join(adminBase, entry.relPath);
      expectedAdminPaths.add(path.resolve(adminDest));
      mkdirSync(path.dirname(adminDest), { recursive: true });
      copyFileSync(webDest, adminDest);
    }

    console.log(
      `[sync:photos] ${entry.relPath} -> ${String(width)}x${String(height)} (${String(Math.round(data.byteLength / 1024))} KB)`,
    );
  }

  for (const existing of collectWebpFiles(webBase)) {
    if (!expectedWebPaths.has(path.resolve(existing))) {
      unlinkSync(existing);
      console.log(`[sync:photos] pruned orphan web asset: ${existing}`);
    }
  }

  for (const existing of collectWebpFiles(adminBase)) {
    if (!expectedAdminPaths.has(path.resolve(existing))) {
      unlinkSync(existing);
      console.log(`[sync:photos] pruned orphan admin asset: ${existing}`);
    }
  }
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href
) {
  syncAllFanpagePhotos().catch((error) => {
    console.error('[sync:photos] FAILED:', error);
    process.exit(1);
  });
}
