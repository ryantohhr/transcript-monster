"use client";

import { usePathname } from "next/navigation";
import React from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "./ui/breadcrumb";

export default function AppBreadcrumb() {
  const pathname = usePathname();
  const paths = pathname.split("/").slice(1);

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {paths.map((path, index) => (
          <React.Fragment key={index}>
            {" "}
            <BreadcrumbItem className="hidden md:block">
              {index === paths.length - 1 ? (
                <BreadcrumbPage>
                  {path.charAt(0).toUpperCase() + path.slice(1)}
                </BreadcrumbPage>
              ) : (
                <BreadcrumbLink href={`/${path}`}>
                  {path.charAt(0).toUpperCase() + path.slice(1)}
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>
            {index !== paths.length - 1 ? (
              <BreadcrumbSeparator className="hidden md:block" />
            ) : null}
          </React.Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
