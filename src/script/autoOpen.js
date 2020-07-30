export default function autoLinkOpen(url, props, bypassKeyword) {
  const { shell } = window.require('electron');
  let keywordStatus = true;
  let filterKeywordStatus = true;

  // console.log(msg);
  // props.keyword.map((item) => console.log(url.toLowerCase().indexOf(item)));
  console.log(props);
  console.log(url);

  // const urlPattern = /\b(?:https?|ftp):\/\/[a-z0-9-+&@#\/%?=~_|!:,.;]*[a-z0-9-+&@#\/%=~_|]/gim;

  // const embedMessage =
  //   msg.embeds.length > 0
  //     ? msg.embeds.map(({ fields }) => {
  //         fields.map(({ value }) => `${value}\n`);
  //       })
  //     : msg.content;

  // console.log(embedMessage);

  // const url = embedMessage.match(urlPattern);

  // console.log(url);

  if (bypassKeyword === false) {
    if (url.indexOf('discord.gg') > -1) {
      return;
    }

    for (let i = 0; i < props.keyword.length; i++) {
      if (url.toLowerCase().indexOf(props.keyword[i].toLowerCase()) == -1) {
        keywordStatus = false;
        console.log(url, keywordStatus, props.keyword[i]);
      } else {
        keywordStatus = true;
        console.log(url, keywordStatus, props.keyword[i]);
        props.filterKeyword.forEach((item) => {
          if (url.toLowerCase().indexOf(item.toLowerCase()) > -1) {
            filterKeywordStatus = false;
          }
        });
      }
      console.log('ks', keywordStatus, 'fk', filterKeywordStatus);
      if (keywordStatus && filterKeywordStatus) {
        // console.log('ks', keywordStatus, 'fk', filterKeywordStatus);
        shell.openExternal(url);
      }
    }

    // props.keyword.forEach((item) => {
    //   console.log(url.toLowerCase().indexOf(item.toLowerCase()));
    //   if (url.toLowerCase().indexOf(item.toLowerCase()) === -1) {
    //     keywordStatus = false;
    //   } else {
    //     keywordStatus = true;
    //   }
    // });

    // console.log('keywordStatus', keywordStatus);
    // props.filterKeyword.forEach((word) => {
    //   if (url.toLowerCase().indexOf(word.toLowerCase()) > -1) {
    //     console.log(url.toLowerCase().indexOf(word.toLowerCase()));
    //     filterKeywordStatus = false;
    //   } else {
    //     filterKeywordStatus = true;
    //   }
    // });

    // console.log('filterKeywordStatus', filterKeywordStatus);

    // if (keywordStatus && filterKeywordStatus) {
    //   shell.openExternal(url);
    // }
  } else {
    if (url.indexOf('discord.gg') > -1) {
      return;
    }
    shell.openExternal(url);
  }
}
