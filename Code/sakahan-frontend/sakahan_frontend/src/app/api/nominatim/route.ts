import axios, { HttpStatusCode } from "axios";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("q") || "";

    // If query is empty, return empty results
    if (!query) return NextResponse.json({ message: "OK", data: [] }, { status: HttpStatusCode.Ok });

    // search area is limited to the Philippines
    const url = "https://nominatim.openstreetmap.org/search";
    const response = await axios.get(url, {
      params: {
        q: query,
        format: "json",
        countrycodes: "ph",
        viewbox: "117.17427453,5.58100332277,126.537423944,18.5052273625",
        bounded: 1,
        polygon_geojson: 1,
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
