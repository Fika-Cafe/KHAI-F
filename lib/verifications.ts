// Helper used on the client to ensure the user has a profile.
// Pass the router from `useRouter()` when calling.
"use client";

type RouterLike = { push: (href: string) => void };
import { request } from "./req";

const verifyProfile = async (router: RouterLike, userId: string) => {
  try {
    const profileVerify = await request(
      `/profile/verifyProfile/${userId}`,
      "GET",
      {}
    );

    if (profileVerify?.status !== 200 || !profileVerify?.data) {
      router.push(`/create-profile`);
      return;
    }

    let userData: { name: string; team: string } = {
      name: profileVerify.data.name,
      team:
        profileVerify.data.team?.[0]?.name ??
        profileVerify.data.memberships?.[0]?.team?.name ??
        "",
    };

    localStorage.setItem("user_info", JSON.stringify(userData));
  } catch (error) {
    console.error("verifyProfile failed", error);
    router.push(`/create-profile`);
  }
};
export { verifyProfile };
