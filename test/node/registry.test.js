const PluginManager = require('../../src/core/plugin-manager');
test('load manifests', async () => {
const pm = new PluginManager({ cogsPath: './cogs' });
await pm.initialize();
const list = pm.list();
expect(Array.isArray(list)).toBe(true);
});