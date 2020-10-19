> ATENÇÃO: Este não é um aplicativo oficial do portal GNRE, e sim uma adaptação para pacote npm, tendo em vista que o mercado não
> possui soluções gratuítas para este fim. Qualquer ajuda é bem vinda!

# gnre-auto


## Resumo

O pacote ```gnre-auto``` possui 2 funções, seguindo os princípios do serviço oficial do portal GNRE:

```GnreLoteRecepcao```

e

```GnreResultadoLote```



## Instalação

```npm i gnre-auto```


## Utilização

***Node.js***

```javascript
  const gnre = require('gnre-auto')
  
  gnre.GnreLoteRecepcao(data, emitente, cert)
```

ou

```javascript
  { GnreLoteRecepcao, GnreResultadoLote } = require('gnre-auto')
  
  gnre.GnreLoteRecepcao(data, emitente, cert)
  gnre.GnreResultadoLote(lote, cert)
```


***GnreLoteRecepcao***
***GnreResultadoLote***

> WORK IN PROGRESS
