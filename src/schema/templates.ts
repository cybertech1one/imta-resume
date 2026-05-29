import z from "zod";

export const templateSchema = z.enum([
	"avicenne",
	"azurill",
	"fes",
	"bronzor",
	"chikorita",
	"ditgar",
	"ditto",
	"gengar",
	"glalie",
	"kakuna",
	"lapras",
	"leafish",
	"onyx",
	"pikachu",
	"rhyhorn",
	"casablanca",
	"rabat",
	"marrakech",
	"tangier",
	"meknes",
	"oujda",
	"kenitra",
	"safi",
	"ifrane",
	"mohammedia",
	"chefchaouen",
	"essaouira",
	"tetouan",
	"agadir",
	"dakhla",
	"settat",
	"jadida",
	"nador",
	"beni-mellal",
	"taza",
]);

export type Template = z.infer<typeof templateSchema>;

/**
 * The templates listed in `printMarginTemplates` require explicit print margin settings.
 *
 * By default, web browsers and PDF generators may apply different margin values or even remove margins
 * when printing resumes. For these selected templates, it's essential to ensure that all printed pages—especially
 * in multi-page resumes—have consistent margins to preserve the intended layout and appearance across all pages.
 *
 * If you are adding a new template that does not have a sidebar background, or any page decoration that extends
 * close to the page borders, consider including it in the `printMarginTemplates` array below.
 */
export const printMarginTemplates = [
	"avicenne",
	"azurill",
	"bronzor",
	"fes",
	"kakuna",
	"lapras",
	"onyx",
	"pikachu",
	"rhyhorn",
	"casablanca",
	"rabat",
	"tangier",
	"safi",
	"ifrane",
	"essaouira",
	"settat",
	"jadida",
	"beni-mellal",
	"taza",
] satisfies Template[] as string[];
