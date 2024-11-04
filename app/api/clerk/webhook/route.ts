import db from "@/server/db";

export const POST = async (req: Request) => {
  const { data } = await req.json();
  console.log("Clerk webhook received:", data);

  const id = data.id;
  const firstName = data.first_name;
  const lastName = data.last_name;
  const emailAddress = data.email_addresses[0]?.email_address;

  await db.user.create({
    data: {
      id,
      firstName,
      lastName,
      email: emailAddress,
    },
  });

  console.log("User has been created successfully!");
  return new Response("Webhook Received:", { status: 200 });
};
