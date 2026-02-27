function parseConstraints(params) {
    const constraints = {};
    for (const param of params) {
        const [key, val] = param.split('=');
        constraints[key] = val;
    }
    return constraints;
}

export default function dimensions(value, params) {
    if (!value) return true;

    const f = value instanceof FileList ? value[0] : value;
    if (!f || typeof f !== 'object') return false;

    const constraints = parseConstraints(params);

    return new Promise((resolve) => {
        if (typeof Image === 'undefined' || typeof FileReader === 'undefined') {
            resolve(true);
            return;
        }

        const reader = new FileReader();
        reader.onload = function (e) {
            const img = new Image();
            img.onload = function () {
                const width = img.width;
                const height = img.height;
                let valid = true;

                if (constraints.width && width !== Number(constraints.width)) valid = false;
                if (constraints.height && height !== Number(constraints.height)) valid = false;
                if (constraints.min_width && width < Number(constraints.min_width)) valid = false;
                if (constraints.min_height && height < Number(constraints.min_height)) valid = false;
                if (constraints.max_width && width > Number(constraints.max_width)) valid = false;
                if (constraints.max_height && height > Number(constraints.max_height)) valid = false;

                if (constraints.ratio) {
                    const parts = constraints.ratio.split('/');
                    const expected = parts.length === 2
                        ? Number(parts[0]) / Number(parts[1])
                        : Number(constraints.ratio);
                    const actual = width / height;
                    if (Math.abs(actual - expected) > 0.01) valid = false;
                }

                resolve(valid);
            };
            img.onerror = () => resolve(false);
            img.src = e.target.result;
        };
        reader.onerror = () => resolve(false);
        reader.readAsDataURL(f);
    });
}
