export function parseBoolean(test: string): boolean {
	if (test === "1") {
		return true;
	} else if (test === "0") {
		return false;
	} else if (test.toLowerCase() === "true") {
		return true;
	} else if (test.toLowerCase() === "false") {
		return false;
	} else {
		throw new Error("Nie właściwy format boolean");
	}
}
