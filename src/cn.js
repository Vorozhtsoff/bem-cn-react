import bemCn from 'bem-cn';

bemCn.setup({
    el: '__',
    mod: '--',
    modValue: '-'
});

function proxyClassName(className, cn) {
    const proxyCn = (...args) =>
        cn(...args).mix(typeof args[0] === 'string' ? '' : className);

    proxyCn.toString = cn.mix(className);
    Object.keys(cn).forEach(key => (proxyCn[key] = cn[key]));

    return proxyCn;
}

const DecorateFunctionComponent = (Component, cn) => {
    const NewComponent = (props, context) => {
        const proxyCn = proxyClassName(props.className, cn);
        return Component({ ...props, cn: proxyCn }, context);
    };

    Object.keys(Component).forEach((b) => {
        NewComponent[b] = Component[b];
    });

    NewComponent.displayName = Component.name;

    return NewComponent;
};


const DecorateClassComponent = (Component, cn, proto) => {
    const originalRender = proto.render;

    Component.prototype.render = function () {
        const proxyCn = proxyClassName(this.props.className, cn);

        return originalRender.call(this, proxyCn);
    };

    return Component;
};


export const cn = (blockName) =>
    (Target) => {
        if (typeof Target !== 'function') return Target;

        const proto = Target.prototype;
        const cn = bemCn(blockName);

        if (typeof proto.render !== 'function') {
            return DecorateFunctionComponent(Target, cn);
        }

        return DecorateClassComponent(Target, cn, proto);
    };
