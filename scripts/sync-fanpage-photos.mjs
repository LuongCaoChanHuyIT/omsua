import { copyFileSync, mkdirSync, readdirSync, realpathSync, writeFileSync } from 'node:fs';
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

export async function validateAndOptimizePhotoBuffer(
  buffer,
  contentType,
  maxDimension = 640,
) {
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

  const { data, info } = await sharp(buffer)
    .rotate()
    .resize({
      width: maxDimension,
      height: maxDimension,
      fit: 'inside',
      withoutEnlargement: true,
    })
    .webp({ quality: 82, effort: 4 })
    .toBuffer({ resolveWithObject: true });

  return {
    data,
    width: info.width,
    height: info.height,
  };
}

export const FANPAGE_PHOTO_SOURCES = [
  {
    relPath: 'branches/branch-hoang-dieu.webp',
    mirrorToAdmin: true,
    maxDimension: 800,
    url: 'https://scontent.fsgn5-1.fna.fbcdn.net/v/t39.30808-6/492006583_1285024350162229_7307278815580420121_n.jpg?stp=dst-jpg_tt6&cstp=mx1252x1252&ctp=s552x414&_nc_cat=104&_nc_map=urlgen_bucketless&ccb=1-7&_nc_sid=f727a1&_nc_eui2=AeFT8EFL5jOpSvJdzeocYOea2oEPWlkwQo7agQ9aWTBCjhn4J-MdjuEdMqEck7wty7f8frQjzTmfkjc-ZwIQyR3n&_nc_ohc=PNkDCmSZxqUQ7kNvwGjsLyW&_nc_oc=AdqU3Mve9Llo7snTJECd9EaU9gAaKNN44NmYzJ_a_qZfdR7eXtPin8-U0xVWMWRjh4HH-Qa9_V5rVv547m8NBpzb&_nc_zt=23&_nc_ht=scontent.fsgn5-1.fna&_nc_gid=pt-Mrjo-7smJj9AEAypWHw&_nc_ss=7b2a8&oh=00_AQT5QHEBqznADBI2AmV190LBEnqe3GlRI1R1q57IT5Uqtg&oe=6B045126',
  },
  {
    relPath: 'branches/branch-hem-33-nct.webp',
    mirrorToAdmin: true,
    maxDimension: 800,
    url: 'https://scontent.fsgn5-10.fna.fbcdn.net/v/t39.30808-6/491043331_1285024300162234_4753694535174971019_n.jpg?stp=dst-jpg_tt6&cstp=mx1250x1250&ctp=s552x414&_nc_cat=109&_nc_map=urlgen_bucketless&ccb=1-7&_nc_sid=f727a1&_nc_eui2=AeH4CxJ384_fmeDzeaPq8SlhwOM7ZMviYSzA4ztky-JhLBVNmumkg2hUNu0gvfXb27hRZQ50dxYMx5YO1qxue8BU&_nc_ohc=lFVoQMiFzc0Q7kNvwEuungq&_nc_oc=AdrSm4xRwjp4YlTnEb0KzbSsfxr7CTtB-ffCrCMQjSZKOUyBJAcCPQX_MywPjKVBn0GTdaEgtZvgDYesSUypPiK2&_nc_zt=23&_nc_ht=scontent.fsgn5-10.fna&_nc_gid=Q0fmL6n7QcANIUNtw9K5Kw&_nc_ss=7b2a8&oh=00_AQRiHcT1zGefvE6i-p9vkUWQao67DoZpwsYSoG1jLdpqpA&oe=6B044D1E',
  },
  {
    relPath: 'branches/branch-nguyen-cong-tru.webp',
    mirrorToAdmin: true,
    maxDimension: 960,
    url: 'https://scontent.fsgn5-12.fna.fbcdn.net/v/t39.30808-6/548025700_1420044753326854_737510483725628327_n.jpg?stp=dst-jpg_tt6&cstp=mx1366x2048&ctp=s552x414&_nc_cat=100&_nc_map=urlgen_bucketless&ccb=1-7&_nc_sid=f727a1&_nc_eui2=AeHq5-0OXNV4WhEH4f5xL6bWX9Xp0E5NhLtf1enQTk2Eu58MzyqysW-FbB-1eFSj7l5wqTVVb6a_lOHgpi-eINhV&_nc_ohc=NHdgyR5GDrYQ7kNvwF54WG6&_nc_oc=AdpFaEeW0lqlYic4VRNWSz5SRKZmIRvppcLVmAodwJt2aOH9KgHwaqL1xGu9BDLowvAQI9UGs2nggbM-pW9j4Wrf&_nc_zt=23&_nc_ht=scontent.fsgn5-12.fna&_nc_gid=Q0fmL6n7QcANIUNtw9K5Kw&_nc_ss=7b2a8&oh=00_AQT8gwKKsTh2i7shOv9ilRKr2MZ2QU663UjeT1IYt4_dzw&oe=6B045DDC',
  },
  {
    relPath: 'branches/branch-duc-trong-vuon-hoa.webp',
    mirrorToAdmin: true,
    maxDimension: 960,
    url: 'https://scontent.fsgn5-2.fna.fbcdn.net/v/t39.30808-6/863511835_1812186644112661_1186378661690163911_n.jpg?stp=dst-jpg_tt6&cstp=mx1536x2048&ctp=s1536x2048&_nc_cat=105&_nc_map=urlgen_bucketless&ccb=1-7&_nc_sid=833d8c&_nc_eui2=AeGaueQeCBqhTcOBHD7DH7ICMN8EyRMPidUw3wTJEw-J1VjPweOAq9gjru1UCPhJRlYI7RMZOpjvp8SCzloy8ZtG&_nc_ohc=kt6IYe4jbr4Q7kNvwEomx57&_nc_oc=Adppv5ZX6_H6SW1FXGkoCkMW41LfKBGmHW4Pj3phD8TBIWW9nBszSanh-EV6-r9e93cAvbGhJWcprpTRJ-ait9iT&_nc_zt=23&_nc_ht=scontent.fsgn5-2.fna&_nc_gid=aLYiPa9y3EgbQS9x_OLoYw&_nc_ss=7b2a8&oh=00_AQQXA1MotPljjBiQEMO06GZUPtMlLQRSfdwnX-CeuMgN5Q&oe=6B046275',
  },
  {
    relPath: 'space/space-morning-01.webp',
    mirrorToAdmin: false,
    maxDimension: 960,
    url: 'https://scontent.fsgn5-12.fna.fbcdn.net/v/t39.30808-6/548025700_1420044753326854_737510483725628327_n.jpg?stp=dst-jpg_tt6&cstp=mx1366x2048&ctp=s552x414&_nc_cat=100&_nc_map=urlgen_bucketless&ccb=1-7&_nc_sid=f727a1&_nc_eui2=AeHq5-0OXNV4WhEH4f5xL6bWX9Xp0E5NhLtf1enQTk2Eu58MzyqysW-FbB-1eFSj7l5wqTVVb6a_lOHgpi-eINhV&_nc_ohc=NHdgyR5GDrYQ7kNvwF54WG6&_nc_oc=AdpFaEeW0lqlYic4VRNWSz5SRKZmIRvppcLVmAodwJt2aOH9KgHwaqL1xGu9BDLowvAQI9UGs2nggbM-pW9j4Wrf&_nc_zt=23&_nc_ht=scontent.fsgn5-12.fna&_nc_gid=Q0fmL6n7QcANIUNtw9K5Kw&_nc_ss=7b2a8&oh=00_AQT8gwKKsTh2i7shOv9ilRKr2MZ2QU663UjeT1IYt4_dzw&oe=6B045DDC',
  },
  {
    relPath: 'space/space-morning-02.webp',
    mirrorToAdmin: false,
    maxDimension: 960,
    url: 'https://scontent.fsgn5-13.fna.fbcdn.net/v/t39.30808-6/549261856_1420044763326853_7200004865330505728_n.jpg?stp=dst-jpg_tt6&cstp=mx1366x2048&ctp=s552x414&_nc_cat=105&_nc_map=urlgen_bucketless&ccb=1-7&_nc_sid=f727a1&_nc_eui2=AeHybhC2pG7El50PnrX2QiHz_QjU1lDFYPv9CNTWUMVg-wCx_y_8RMwRdR5iJB1UHy4XDU79JpqozXF4r0V-G_LL&_nc_ohc=EB7AetDC3tcQ7kNvwFxx_Xk&_nc_oc=AdouyxhFB_Z4kUTjjYAz-z_T_MmRo_ELImYbWwidOrL7UFsKT5-HMmN-gbUzhdFfDw50DEvm04zobFHBKfqlBfqX&_nc_zt=23&_nc_ht=scontent.fsgn5-13.fna&_nc_gid=Q0fmL6n7QcANIUNtw9K5Kw&_nc_ss=7b2a8&oh=00_AQRvF0-dhv9ZhjC9rX5HjLd0n6CCwMjvu5Jn--PA_EsCjA&oe=6B044C8B',
  },
  {
    relPath: 'space/space-street-dalat.webp',
    mirrorToAdmin: false,
    maxDimension: 800,
    url: 'https://scontent.fsgn5-1.fna.fbcdn.net/v/t39.30808-6/492008759_1285024283495569_8542372184927399953_n.jpg?stp=dst-jpg_tt6&cstp=mx1252x1252&ctp=s552x414&_nc_cat=100&_nc_map=urlgen_bucketless&ccb=1-7&_nc_sid=f727a1&_nc_eui2=AeFQ2oQKtQAiLQvbehPF-3TPJ0coq4bRvIknRyirhtG8iTD1RMy8LFeOp5Kl0OXysqLMXsPZauZfwtoLPD3WnNlk&_nc_ohc=ldRmEa-20ScQ7kNvwEdJo-n&_nc_oc=AdoPD-kUr1Sr-A4o-DNNM6EbreZii_pS1heRZ_YGrgHi-_QeSnNk3BtOiJz6D6xNlI4sTKdTF73wbkvePU7SBBpb&_nc_zt=23&_nc_ht=scontent.fsgn5-1.fna&_nc_gid=pt-Mrjo-7smJj9AEAypWHw&_nc_ss=7b2a8&oh=00_AQQK0uQ8NbdmCdWSOcnIxjQPiHr3RuKwzMIJAwE5pi2YjQ&oe=6B0450EF',
  },
  {
    relPath: 'products/drink-tra-sua-atiso.webp',
    mirrorToAdmin: false,
    maxDimension: 640,
    url: 'https://scontent.fsgn5-8.fna.fbcdn.net/v/t39.30808-6/491996875_1285024310162233_3428697168946334763_n.jpg?stp=dst-jpg_tt6&cstp=mx2048x2048&ctp=p526x296&_nc_cat=102&_nc_map=urlgen_bucketless&ccb=1-7&_nc_sid=f727a1&_nc_eui2=AeG0115XS0lDRb4sPyIYw_ovOVFLymScSrs5UUvKZJxKu8Am05LKmfreB5an8WcyUJE_5lBWRf9IzXPeeMQwIiiM&_nc_ohc=5WbkCmXg2vQQ7kNvwEbRJub&_nc_oc=AdobIxTZK84qZpgN_NE5jTPmCYXFE-a8vN-pAcJ4KdozAovkbMvkRJj6UXVuQ8u4AIDmZk8k3XlQwlM76_fr_MTN&_nc_zt=23&_nc_ht=scontent.fsgn5-8.fna&_nc_gid=vjiTGnuafVHRgXSDyL043g&_nc_ss=7b2a8&oh=00_AQQqGkxZWERHoFC369pXOC3jFjJTENQt841XFU7K61eOQA&oe=6B047474',
  },
  {
    relPath: 'products/drink-atiso-chuoi.webp',
    mirrorToAdmin: false,
    maxDimension: 640,
    url: 'https://scontent.fsgn5-7.fna.fbcdn.net/v/t39.30808-6/490244681_1281262833871714_3765918317492135566_n.jpg?stp=dst-jpg_tt6&cstp=mx1536x2048&ctp=p526x296&_nc_cat=108&_nc_map=urlgen_bucketless&ccb=1-7&_nc_sid=f727a1&_nc_eui2=AeHMEbbWWwxvyFWQRKbuv4D2qXzdhlfYu1WpfN2GV9i7VUeWENSiQ7TrWkFzJPuInzK9RrGsiBKcPnp1WUhDWcDj&_nc_ohc=9JNb3wP1SawQ7kNvwHvy3h9&_nc_oc=AdoWeJd4xsPrDY6oHBWePNVN2g4caQ3TsUH-_gAgtNwcRcIn1XS21vldH9be6KAIj2hO6NPLmSi0vPil75TcBo4Q&_nc_zt=23&_nc_ht=scontent.fsgn5-7.fna&_nc_gid=vjiTGnuafVHRgXSDyL043g&_nc_ss=7b2a8&oh=00_AQSrwoApuFugrQhuo0bDj09G1GxfCqmzyIOjq8sGngczpg&oe=6B0457F6',
  },
  {
    relPath: 'products/drink-quyt-nhai.webp',
    mirrorToAdmin: false,
    maxDimension: 640,
    url: 'https://scontent.fsgn5-21.fna.fbcdn.net/v/t39.30808-6/619618333_1535984968399498_2149815520543420901_n.jpg?stp=dst-jpg_tt6&cstp=mx1638x2048&ctp=s640x640&_nc_cat=107&_nc_map=urlgen_bucketless&ccb=1-7&_nc_sid=833d8c&_nc_eui2=AeFZaLXn21c9uDoCtuodAEfr5aTux8rpwdvlpO7HyunB2-o9Rny5VowxXOVZwPSWQZXOcqLqoHpz76uq-1HwLv2n&_nc_ohc=qnI9xWxFa_UQ7kNvwG44qfE&_nc_oc=AdqS2-WNnUbTqWFj-golXU8s3YAWt1lN6xBcWvgCE2-eLt2Y4EMUXgBkyTakq0PcyZ6OASjL6YBHI-WMZpG-mTT1&_nc_zt=23&_nc_ht=scontent.fsgn5-21.fna&_nc_gid=OMST3HZ2LIBDCJ0C5tgUJg&_nc_ss=7b2a8&oh=00_AQSz-6aN1g1JUQ3asUEOfE-d5otNMkwpPIHFGX37Wni1dw&oe=6B046985',
  },
  {
    relPath: 'products/drink-matcha-latte.webp',
    mirrorToAdmin: false,
    maxDimension: 640,
    url: 'https://scontent.fsgn5-12.fna.fbcdn.net/v/t39.30808-6/543181062_1408975524433777_2588488351793530384_n.jpg?stp=cp6_dst-jpg_tt6&cstp=mx1080x1351&ctp=s1080x1351&_nc_cat=101&_nc_map=urlgen_bucketless&ccb=1-7&_nc_sid=f727a1&_nc_eui2=AeETcTCZZC6uLu_xJlXLDPSKroV1j3HWXniuhXWPcdZeeDA0EMLjQqAVaZTcDLydjNRhIMrqVLLuqe1DNDvbtcWw&_nc_ohc=l3fre8UVzN8Q7kNvwHkyZmO&_nc_oc=AdowxVSGTbB3JNOq_-jChQ8aCJVHz4iFBqsuNQTrRo4bT3kB3pQLiyKbwPGn3IQGdDKdOoi_03UwwFUPvASdmraM&_nc_zt=23&_nc_ht=scontent.fsgn5-12.fna&_nc_gid=aufVIgO9sgkMRrJhQJHMWg&_nc_ss=7b2a8&oh=00_AQQho1TjgZnqrSkDuEa5vovkBvEX7Nxlwj9Rjvb_HhPYLQ&oe=6B044E41',
  },
  {
    relPath: 'products/drink-matcha-oreo.webp',
    mirrorToAdmin: false,
    maxDimension: 640,
    url: 'https://scontent.fsgn5-12.fna.fbcdn.net/v/t39.30808-6/543365004_1408975527767110_505982448827614146_n.jpg?stp=cp6_dst-jpg_tt6&cstp=mx1080x1351&ctp=s1080x1351&_nc_cat=103&_nc_map=urlgen_bucketless&ccb=1-7&_nc_sid=f727a1&_nc_eui2=AeE4APyi-TMmjBJaaYofxGRQt9C8BoNm73O30LwGg2bvcycazfjmJKuKxK_ilSvb4NGfr7KK42y9wowxAPEsAF88&_nc_ohc=dnfz1wzUyH0Q7kNvwF3cEEo&_nc_oc=AdoJIhm2GC-zQIU2IckPosQDKyARj9Ou94H2fXLEUWIttkGUKse33QGuGlnxOzifnEi2t6wlbzNIyzbEjB6cDIvr&_nc_zt=23&_nc_ht=scontent.fsgn5-12.fna&_nc_gid=Nl5QXWCa8K9gB6xbkGomNg&_nc_ss=7b2a8&oh=00_AQS-mFQy8X6qhHq0lf1wIIPbLvdFjIEBN5u0YDSQs1treA&oe=6B045A54',
  },
  {
    relPath: 'products/drink-ca-phe-tiramisu.webp',
    mirrorToAdmin: false,
    maxDimension: 640,
    url: 'https://scontent.fsgn5-18.fna.fbcdn.net/v/t39.30808-6/491396372_1282852653712732_1880512663039686558_n.jpg?stp=dst-jpg_tt6&cstp=mx1080x1351&ctp=s640x640&_nc_cat=106&_nc_map=urlgen_bucketless&ccb=1-7&_nc_sid=f727a1&_nc_eui2=AeFR8NuBQSIPwFRis2Yr6w249eQkoF8av0L15CSgXxq_QgNLEOOC0otWPrxIUqnA2d0vG52j7RsVWYieqn5L6Jxj&_nc_ohc=mfy-ZNdkIewQ7kNvwGHA0YY&_nc_oc=AdpXX9C6BH6ujwgw2-8qzqewdj_2H0cMiOmMbqOcFeZhLVjBTUMh0IYrKnohoe-oQLEbtbfbsXm1vEsBmS9K_omu&_nc_zt=23&_nc_ht=scontent.fsgn5-18.fna&_nc_gid=zTZIt8TVYKcRyvbQ_k24hw&_nc_ss=7b2a8&oh=00_AQRFyJQtQ8EzuJlK0kFEW-DEo-PGBtAOET8pjzdIvktcRg&oe=6B044E97',
  },
  {
    relPath: 'products/drink-ca-phe-da-lat.webp',
    mirrorToAdmin: false,
    maxDimension: 640,
    url: 'https://scontent.fsgn5-3.fna.fbcdn.net/v/t39.30808-6/489624159_1277775404220457_5015849322556943084_n.jpg?stp=dst-jpg_tt6&cstp=mx1079x1350&ctp=s640x640&_nc_cat=108&_nc_map=urlgen_bucketless&ccb=1-7&_nc_sid=f727a1&_nc_eui2=AeEHmvWXXPe1zSy5DZdPKR_tsZfuutVwTVOxl-661XBNUzRXC4-sZ7tv3zgz9iE_AYfr2EQkCvesfuCKy6oIFild&_nc_ohc=45o5EAEKPywQ7kNvwEsaH6-&_nc_oc=AdpcV8rJDa_yNpVGPP3aayTD4nyB9yr0XUZ87PsGuz3A8yqGy79mzIdWgyWRJ0Hc8t0gRGVnD2whRDnM6DBWZ0kK&_nc_zt=23&_nc_ht=scontent.fsgn5-3.fna&_nc_gid=zTZIt8TVYKcRyvbQ_k24hw&_nc_ss=7b2a8&oh=00_AQTVrsm5Jnle8mJpbTw49OUENknwaxOjMBGLMYuqgLlY1w&oe=6B046B46',
  },
  {
    relPath: 'seasonal/seasonal-hong-trung-lang.webp',
    mirrorToAdmin: false,
    maxDimension: 960,
    url: 'https://scontent.fsgn5-22.fna.fbcdn.net/v/t39.30808-6/856375821_1801587178505941_6768353433244066752_n.jpg?stp=dst-jpg_tt6&cstp=mx1448x2048&ctp=s851x315&_nc_cat=110&_nc_map=urlgen_bucketless&ccb=1-7&_nc_sid=833d8c&_nc_eui2=AeETEgXZH4BBoA3LnHeUk05uaPcROeTpVNlo9xE55OlU2RF-bB66qrZhVP_0nuNZcrTDxXDBiRf4CF8dCluiBuoN&_nc_ohc=qXjydlorf9cQ7kNvwFlFV-s&_nc_oc=AdoeevHK6a3Wwv2oN02M_avsUU2PQQpeaDMSXXePqL0OK6JppSvD6SsxE2hSxIRS37RudEPbqddC40DxTBnL_-kK&_nc_zt=23&_nc_ht=scontent.fsgn5-22.fna&_nc_gid=AyP4lq8FwXuV2cK3GvZzXQ&_nc_ss=7b2a8&oh=00_AQQ9Hc0mSoUgNHfDVmtv27M9oLc0BauXz8lkwvK1B7AqdQ&oe=6B0473B0',
  },
  {
    relPath: 'products/topping-khoai-tam.webp',
    mirrorToAdmin: false,
    maxDimension: 512,
    url: 'https://scontent.fsgn5-13.fna.fbcdn.net/v/t39.30808-6/492723918_1293481385983192_8511663928692684871_n.jpg?stp=cp6_dst-jpg_tt6&cstp=mx1080x1351&ctp=s640x640&_nc_cat=104&_nc_map=urlgen_bucketless&ccb=1-7&_nc_sid=f727a1&_nc_eui2=AeHdvAyaPv8jOVEUojhhU15FBdvdvKSvhBcF2928pK-EF0H3vt3FINfIC19izmp0Np7t3BrzjhT8k94wHUXQX8y2&_nc_ohc=N1VKgnegO_IQ7kNvwEUczOv&_nc_oc=AdoZVtC3gnaybUPSCkW4ONbgCHXul1S9C_1XYbplC7dZVUkVAhgf9w3AepFlnbH1dHZnPHK1m85LozRC-tf6O33O&_nc_zt=23&_nc_ht=scontent.fsgn5-13.fna&_nc_gid=WP5FB1w-kQ88aKM3bYVkOA&_nc_ss=7b2a8&oh=00_AQTGdXjqK0K9ddCVj4uoy--1e0yxlVxQ4ScbVMAzQoq_hw&oe=6B046EF2',
  },
  {
    relPath: 'products/snack-banh-trang-top-mo.webp',
    mirrorToAdmin: false,
    maxDimension: 640,
    url: 'https://scontent.fsgn5-11.fna.fbcdn.net/v/t39.30808-6/492362225_1293623299302334_3499813956209347588_n.jpg?stp=dst-jpg_tt6&cstp=mx1078x1350&ctp=s1078x1350&_nc_cat=104&_nc_map=urlgen_bucketless&ccb=1-7&_nc_sid=f727a1&_nc_eui2=AeGG7DOjfOeJzICI_GfVx_nuY_nRDISgG1hj-dEMhKAbWMiiwHv4LSQl2IWMly5zROumQY3pPMsl1GoOFbgCZfP7&_nc_ohc=Ruyvnmsr_F4Q7kNvwEupmAd&_nc_oc=AdqIwQ7KYzDCCxM-Kn1O1CHRJDqVB5fEXKMLO2Qvv0LwCu1YTMDLosydojaORdMPZVjHUubDnQ9Hre4KOX-PJxbt&_nc_zt=23&_nc_ht=scontent.fsgn5-11.fna&_nc_gid=zttB1yLK1iugwq5ZA3IyIQ&_nc_ss=7b2a8&oh=00_AQS5TaDjcWodv1CIIpPDZ0fnqdhLalseknwMgcXYVN93hQ&oe=6B047329',
  },
  {
    relPath: 'products/snack-banh-trang-sot-tac.webp',
    mirrorToAdmin: false,
    maxDimension: 640,
    url: 'https://scontent.fsgn5-22.fna.fbcdn.net/v/t39.30808-6/487414781_1268933241771340_1429769129729889271_n.jpg?stp=cp6_dst-jpg_tt6&cstp=mx1634x2048&ctp=s552x414&_nc_cat=110&_nc_map=urlgen_bucketless&ccb=1-7&_nc_sid=f727a1&_nc_eui2=AeEH6NtAWVgxHYJyZhdvHAL1QMIbPTnjp0hAwhs9OeOnSBGG_uqESFole-DrEqFZrXYR8M9H2_5CR00WxQjnOdwH&_nc_ohc=uRd5S_bi4a8Q7kNvwH1f4Cu&_nc_oc=AdoVcJvfn2zLwpUktNiB11LCudQ95bUwHULxjyOpQUCpmOgnI5lyog4LucusrgGtjHlfIer5cJ4nyOvtYxkcT4J_&_nc_zt=23&_nc_ht=scontent.fsgn5-22.fna&_nc_gid=cru_RTsegK31FCZslN3-Ig&_nc_ss=7b2a8&oh=00_AQSvBUVJIOteiVCqGL7KOYgGWO5UUeytggEd0z4XiHiMBQ&oe=6B0466A6',
  },
  {
    relPath: 'products/snack-banh-cham-long-dao.webp',
    mirrorToAdmin: false,
    maxDimension: 640,
    url: 'https://scontent.fsgn5-18.fna.fbcdn.net/v/t39.30808-6/487171999_1266908505307147_8743356903196529238_n.jpg?stp=cp6_dst-jpg_tt6&cstp=mx2048x2048&ctp=s552x414&_nc_cat=107&_nc_map=urlgen_bucketless&ccb=1-7&_nc_sid=f727a1&_nc_eui2=AeHOFs6ePlM8lVvDv9QdMYL_GBHeALpN3tUYEd4Auk3e1TtYDU0b80zaRRIRpPMK_LkDWwdfj61twE70MaCXDC-8&_nc_ohc=0q9HVf1Xb_QQ7kNvwEuTzv-&_nc_oc=Adr1YxJIOLwqx5wHgssyBS9VH3zlDVjXMRkgvsKMn-jh9dHW9IUrZh7FS4LH4F_jkIKgWSwIDzcqFwTbDvknhtg5&_nc_zt=23&_nc_ht=scontent.fsgn5-18.fna&_nc_gid=lA4zwU9xdws9lgXv47mmww&_nc_ss=7b2a8&oh=00_AQQm34YJFPh3hjQUBhGSo5V_YvGM0J-YsLw95v7rUBwJ1Q&oe=6B045AB8',
  },
];

export async function syncAllFanpagePhotos() {
  const webBase = path.join(REPO_ROOT, 'apps', 'web', 'public', 'images', 'fanpage');
  const adminBase = path.join(REPO_ROOT, 'apps', 'admin', 'public', 'images', 'fanpage');

  for (const entry of FANPAGE_PHOTO_SOURCES) {
    const response = await fetch(entry.url, {
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

    const rawBuffer = Buffer.from(await response.arrayBuffer());
    const contentType = response.headers.get('content-type');
    const { data, width, height } = await validateAndOptimizePhotoBuffer(
      rawBuffer,
      contentType,
      entry.maxDimension,
    );

    const webDest = path.join(webBase, entry.relPath);
    mkdirSync(path.dirname(webDest), { recursive: true });
    writeFileSync(webDest, data);

    if (entry.mirrorToAdmin) {
      const adminDest = path.join(adminBase, entry.relPath);
      mkdirSync(path.dirname(adminDest), { recursive: true });
      copyFileSync(webDest, adminDest);
    }

    console.log(
      `[sync:photos] ${entry.relPath} -> ${String(width)}x${String(height)} (${String(Math.round(data.byteLength / 1024))} KB)`,
    );
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
