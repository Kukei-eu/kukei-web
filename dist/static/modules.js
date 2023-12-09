class FormatNumber extends HTMLElement {
	connectedCallback() {
		this.innerHTML = this.formatNumber(this.innerHTML);
	}

	formatNumber(number) {
		const parsed = parseFloat(number);;
		if (isNaN(parsed)) {
			return number;
		}
		return parsed.toLocaleString();
	}
}

const main = () => {
	customElements.define('format-number', FormatNumber);
};

main();
