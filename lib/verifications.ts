import router from "next/router";
import { request } from "./req";

const verifyProfile = async (userId: string) => {
  try {
    const profileVerify = await request(
      `/profile/verifyProfile/${userId}`,
      "GET",
      {}
    );
    console.log(profileVerify);
    let userData: { name: string; team: string } = {
      name: profileVerify.data.name,
      team:
        profileVerify.data.team?.[0]?.name ??
        profileVerify.data.memberships?.[0]?.team?.name ??
        "",
    };

    localStorage.setItem("user_info", JSON.stringify(userData));
    if (profileVerify?.status !== 200) {
      router.push(`/create-profile`);
    }
  } catch (error) {
    console.error("verifyProfile failed", error);
  }
};
export { verifyProfile };
