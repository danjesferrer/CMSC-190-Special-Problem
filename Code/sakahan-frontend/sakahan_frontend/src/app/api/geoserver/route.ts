import axios, { HttpStatusCode } from "axios";
import { type NextRequest, NextResponse } from "next/server";
import { CategoryType } from "@/enums";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const cql_filter = searchParams.get("cql_filter") || "";

    const url = `${process.env.NEXT_PUBLIC_GEOSERVER_URL}/geoserver/sakahan/wfs`;

    const response = await axios.get(url, {
      params: {
        service: "wfs",
        version: "2.0.0",
        request: "GetFeature",
        typeNames: `sakahan:api_${CategoryType.CURRENT.toLowerCase()}geometryfeature`,
        outputFormat: "application/json",
        cql_filter: `${cql_filter}`,
      },
    });

    return NextResponse.json({ message: response.statusText, data: response.data }, { status: response.status });
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        return NextResponse.json(
          { message: error.response.statusText, data: error.response.data },
          { status: error.response.status },
        );
      } else if (error.request) {
        // The request was made but no response was received
        return NextResponse.json(
          { message: "No Response Received", data: [] },
          { status: HttpStatusCode.InternalServerError },
        );
      }
    }

    // Something happened in setting up the request that triggered an Error
    return NextResponse.json(
      { message: "Internal Server Error", data: [] },
      { status: HttpStatusCode.InternalServerError },
    );
  }
}
