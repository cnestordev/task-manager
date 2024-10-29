import * as Yup from "yup";

export const TeamSchema = Yup.object().shape({
  teamName: Yup.string()
    .required("Team name is required")
    .min(3, "Team name must be at least 3 characters long"),
});
