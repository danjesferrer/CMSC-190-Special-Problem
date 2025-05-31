import axios, { HttpStatusCode } from "axios";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get("type") || "";

    let url;
    let response;

    url = `${process.env.NEXT_PUBLIC_HOST}/api/${type}/crops`;
    response = await axios.get(url);
    const crops = response.data;

    url = `${process.env.NEXT_PUBLIC_HOST}/api/${type}/crops-elements`;
    response = await axios.get(url);
    const cropsElements = response.data;

    const categoryIds = new Set(cropsElements.map((element: any) => element.category.id));
    const data = [];
    for (const crop of crops) {
      if (!categoryIds.has(crop.id)) {
        data.push({ ...crop, category: null });
      }
    }

    data.push(...cropsElements);

    const sortedData = data.sort((a, b) => {
      // Use category.name if category exists, otherwise use the crop name
      const nameA = a.category?.name.toLowerCase() ?? a.name.toLowerCase();
      const nameB = b.category?.name.toLowerCase() ?? b.name.toLowerCase();

      return nameA.localeCompare(nameB);
    });

    return NextResponse.json({ message: response.statusText, data: sortedData }, { status: response.status });
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
