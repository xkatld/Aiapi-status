/* 交互增强：Tab 切换（说明文字 + 按 tab 过滤厂商卡片显示）。页面数据完全静态。 */
(function () {
  var tabs = document.querySelectorAll('.tab');
  var desc = document.getElementById('tabs-desc');
  var cards = document.querySelectorAll('.card[data-tab]');

  function activate(tab) {
    tabs.forEach(function (t) {
      t.classList.toggle('tab--active', t === tab);
    });
    var tabId = tab.getAttribute('data-tab');
    cards.forEach(function (c) {
      c.hidden = c.getAttribute('data-tab') !== tabId;
    });
    if (desc) {
      desc.textContent = tab.getAttribute('data-desc') || '';
    }
  }

  tabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      activate(tab);
    });
  });
})();
