import {
  existsSync,
} from "node:fs";
import {
  resolve,
} from "node:path";

import {
  describe,
  expect,
  it,
} from "vitest";

import {
  contentType as appleContentType,
  size as appleSize,
} from "@/app/apple-icon";
import {
  contentType as iconContentType,
  size as iconSize,
} from "@/app/icon";
import {
  alt as openGraphAlt,
  contentType as openGraphContentType,
  size as openGraphSize,
} from "@/app/opengraph-image";
import {
  alt as twitterAlt,
  contentType as twitterContentType,
  size as twitterSize,
} from "@/app/twitter-image";

describe("brand metadata assets", () => {
  it("defines a 1200 by 630 Open Graph image", () => {
    expect(openGraphSize).toEqual({
      width: 1200,
      height: 630,
    });

    expect(openGraphContentType).toBe(
      "image/png",
    );
    expect(openGraphAlt.length).toBeGreaterThan(10);
  });

  it("defines a matching Twitter image", () => {
    expect(twitterSize).toEqual(openGraphSize);
    expect(twitterContentType).toBe(
      openGraphContentType,
    );
    expect(twitterAlt).toBe(openGraphAlt);
  });

  it("defines browser and Apple icons", () => {
    expect(iconSize).toEqual({
      width: 32,
      height: 32,
    });
    expect(iconContentType).toBe("image/png");

    expect(appleSize).toEqual({
      width: 180,
      height: 180,
    });
    expect(appleContentType).toBe("image/png");
  });

  it("removes the default Next.js favicon", () => {
    expect(
      existsSync(
        resolve(
          process.cwd(),
          "src/app/favicon.ico",
        ),
      ),
    ).toBe(false);
  });
});
