---
heading: "Ім'я Прізвище"
show_tagline: true
charts: true
---

{%- for work in site.works %}
<details class="work{% if work.wide %} wide{% endif %}" id="work-{{ work.slug }}" open>
  <summary>
    <span class="work-title">{{ work.title }}</span>
    {%- if work.example %} <span class="tag">приклад</span>{% endif %}
  </summary>

  <div class="work-body">
    <div class="note">{{ work.content | markdownify }}</div>
    {%- if work.example %}
    <p class="note swap">Це приклад із шаблону. Замініть його своєю роботою або
       видаліть файл <code>_works/{{ work.slug }}.md</code>.</p>
    {%- endif %}
  </div>
</details>
{%- endfor %}
